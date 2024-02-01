/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
import type { Options } from "@storybook/types";
// eslint-disable-next-line import/no-unresolved
import { getConfiguration, getGitInfo, GitInfo } from "chromatic/node";

import {
  CHROMATIC_BASE_URL,
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
import { GitInfoPayload, LocalBuildProgress, ProjectInfoPayload } from "./types";
import { SharedState } from "./utils/SharedState";
import { updateChromaticConfig } from "./utils/updateChromaticConfig";

/**
 * to load the built addon in this test Storybook
 */
function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve("./manager.mjs")];
}

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

async function serverChannel(
  channel: Channel,
  // configDir is the standard storybook flag (-c to the storybook CLI)
  // configFile is the `main.js` option, which should be set by the user to correspond to the
  //   chromatic option (-c to the chromatic CLI)
  { configDir, configFile, presets }: Options & { configFile: string }
) {
  const api = await presets.apply<any>("experimental_serverAPI");
  const configuration = await getConfiguration(configFile);
  const { projectId: initialProjectId } = configuration;

  const projectInfoState = SharedState.subscribe<ProjectInfoPayload>(PROJECT_INFO, channel);
  projectInfoState.value = initialProjectId ? { projectId: initialProjectId } : {};

  let lastProjectId = initialProjectId;
  projectInfoState.on("change", async ({ projectId } = {}) => {
    if (!projectId || projectId === lastProjectId) return;
    lastProjectId = projectId;

    const writtenConfigFile = configFile || "chromatic.config.json";
    try {
      await updateChromaticConfig(writtenConfigFile, {
        ...configuration,
        projectId,
      });

      projectInfoState.value = {
        ...projectInfoState.value,
        written: true,
        configFile: writtenConfigFile,
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
  channel.on(REMOVE_ADDON, async () => {
    await api.removeAddon(PACKAGE_NAME);
  });

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
