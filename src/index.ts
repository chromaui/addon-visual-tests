/* eslint-disable no-console */
import { watch } from "node:fs";
import { normalize, relative } from "node:path";

import type { Channel } from "@storybook/channels";
import type { Options } from "@storybook/types";
import { type Configuration, getConfiguration, getGitInfo, type GitInfo } from "chromatic/node";

import {
  CHROMATIC_BASE_URL,
  CONFIG_INFO,
  GIT_INFO,
  GIT_INFO_ERROR,
  LOCAL_BUILD_PROGRESS,
  PACKAGE_NAME,
  PROJECT_INFO,
  REMOVE_ADDON,
  START_BUILD,
  STOP_BUILD,
} from "./constants";
import { runChromaticBuild, stopChromaticBuild } from "./runChromaticBuild";
import {
  ConfigInfoPayload,
  ConfigurationUpdate,
  GitInfoPayload,
  LocalBuildProgress,
  ProjectInfoPayload,
} from "./types";
import { SharedState } from "./utils/SharedState";
import { updateChromaticConfig } from "./utils/updateChromaticConfig";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

// Nullify any suggestions that are the same as the defaults, to suggest removal.
// Drop suggestions for removal that don't actually appear in the current config.
const suggestRemovals = (
  config: Configuration,
  defaults: Configuration,
  update: ConfigurationUpdate
) =>
  Object.fromEntries(
    (Object.entries(update) as [keyof Configuration, Configuration[keyof Configuration]][])
      .map(([key, value]) => [key, value === defaults[key] ? null : value])
      .filter(([key, value]) => value !== null || config[key as keyof Configuration] !== undefined)
  );

// Detect problems in the current configuration and suggest updates.
const getConfigInfo = async (
  configuration: Awaited<ReturnType<typeof getConfiguration>>,
  { configDir }: Options
) => {
  const defaults: Configuration = {
    storybookBaseDir: ".",
    storybookConfigDir: ".storybook",
  } as const;

  const problems: ConfigurationUpdate = {};
  const suggestions: ConfigurationUpdate = {};

  const { repositoryRootDir } = await getGitInfo();
  const baseDir = repositoryRootDir && normalize(relative(repositoryRootDir, process.cwd()));
  if (baseDir !== normalize(configuration.storybookBaseDir ?? "")) {
    problems.storybookBaseDir = baseDir;
  }

  if (configDir !== normalize(configuration.storybookConfigDir ?? "")) {
    problems.storybookConfigDir = normalize(relative(process.cwd(), configDir));
  }

  if (!configuration.zip) {
    suggestions.zip = true;
  }

  return {
    configuration,
    problems: suggestRemovals(configuration, defaults, problems),
    suggestions: suggestRemovals(configuration, defaults, suggestions),
  };
};

// Polls for changes to the Git state and invokes the callback when it changes.
// Uses a recursive setTimeout instead of setInterval to avoid overlapping async calls.
const observeGitInfo = async (
  interval: number,
  callback: (info: GitInfo, prevInfo?: GitInfo) => void,
  errorCallback: (e: Error) => void
) => {
  let prev: GitInfo | undefined;
  let prevError: Error | undefined;
  let timer: NodeJS.Timeout | undefined;
  const act = async () => {
    try {
      const gitInfo = await getGitInfo();
      if (Object.entries(gitInfo).some(([key, value]) => prev?.[key as keyof GitInfo] !== value)) {
        callback(gitInfo, prev);
      }
      prev = gitInfo;
      prevError = undefined;
      timer = setTimeout(act, interval);
    } catch (e: any) {
      if (prevError?.message !== e.message) {
        console.error(`Failed to fetch git info, with error:\n${e}`);
        errorCallback(e);
      }
      prev = undefined;
      prevError = e;
      timer = setTimeout(act, interval);
    }
  };
  act();

  return () => clearTimeout(timer);
};

const watchConfigFile = async (
  configFile: string | undefined,
  onChange: (configuration: Awaited<ReturnType<typeof getConfiguration>>) => Promise<void>
) => {
  const configuration = await getConfiguration(configFile);
  await onChange(configuration);

  if (configuration.configFile) {
    watch(configuration.configFile, async (eventType: string, filename: string | null) => {
      if (filename) await onChange(await getConfiguration(filename));
    });
  }
};

async function serverChannel(channel: Channel, options: Options & { configFile?: string }) {
  const { configFile, presets } = options;

  // Lazy load the API since we don't need it right away
  const apiPromise = presets.apply<any>("experimental_serverAPI");

  // This yields an empty object if the file doesn't exist and no explicit configFile is specified
  const { projectId: initialProjectId } = await getConfiguration(configFile);

  const projectInfoState = SharedState.subscribe<ProjectInfoPayload>(PROJECT_INFO, channel);
  projectInfoState.value = initialProjectId ? { projectId: initialProjectId } : {};

  let lastProjectId = initialProjectId;
  projectInfoState.on("change", async ({ projectId } = {}) => {
    if (!projectId || projectId === lastProjectId) return;
    lastProjectId = projectId;

    const writtenConfigFile = configFile || "chromatic.config.json";
    try {
      const { configFile: actualConfigFile, ...config } = await getConfiguration(writtenConfigFile);
      await updateChromaticConfig(writtenConfigFile, { ...config, projectId });

      projectInfoState.value = {
        ...projectInfoState.value,
        written: true,
        configFile: actualConfigFile,
      };
    } catch (err) {
      console.warn(`Failed to update your main configuration:\n\n ${err}`);

      projectInfoState.value = {
        ...projectInfoState.value,
        written: false,
        configFile: writtenConfigFile,
      };
    }
  });

  const localBuildProgress = SharedState.subscribe<LocalBuildProgress>(
    LOCAL_BUILD_PROGRESS,
    channel
  );

  channel.on(START_BUILD, async ({ accessToken: userToken }) => {
    const { projectId } = projectInfoState.value || {};
    try {
      await runChromaticBuild(localBuildProgress, { configFile, projectId, userToken });
    } catch (e) {
      console.error(`Failed to run Chromatic build, with error:\n${e}`);
    }
  });

  channel.on(STOP_BUILD, stopChromaticBuild);
  channel.on(REMOVE_ADDON, () =>
    apiPromise.then((api) => api.removeAddon(PACKAGE_NAME)).catch((e) => console.error(e))
  );

  const configInfoState = SharedState.subscribe<ConfigInfoPayload>(CONFIG_INFO, channel);
  const gitInfoState = SharedState.subscribe<GitInfoPayload>(GIT_INFO, channel);
  const gitInfoError = SharedState.subscribe<Error>(GIT_INFO_ERROR, channel);

  observeGitInfo(
    5000,
    (info) => {
      gitInfoError.value = undefined;
      gitInfoState.value = info;
    },
    (error: Error) => {
      gitInfoError.value = error;
    }
  );

  watchConfigFile(configFile, async (configuration) => {
    configInfoState.value = await getConfigInfo(configuration, options);
  });

  return channel;
}

const config = {
  managerEntries,
  experimental_serverChannel: serverChannel,
  env: async (
    env: Record<string, string>,
    { configType }: { configType: "DEVELOPMENT" | "PRODUCTION" }
  ) => {
    if (configType === "PRODUCTION") return env;

    return {
      ...env,
      CHROMATIC_BASE_URL,
    };
  },
};

export default config;
