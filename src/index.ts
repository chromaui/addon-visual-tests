/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { getConfiguration, getGitInfo, GitInfo } from "chromatic/node";

import {
  CHROMATIC_BASE_URL,
  GIT_INFO,
  GIT_INFO_ERROR,
  LOCAL_BUILD_PROGRESS,
  PROJECT_INFO,
  START_BUILD,
} from "./constants";
import { runChromaticBuild } from "./runChromaticBuild";
import { GitInfoPayload, LocalBuildProgress, ProjectInfoPayload } from "./types";
import { useAddonState } from "./useAddonState/server";
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
  callback: (info: GitInfo, prevInfo: GitInfo) => void,
  errorCallback: (e: Error) => void
) => {
  let prev: GitInfo;
  let timer: NodeJS.Timeout | undefined;
  const act = async () => {
    try {
      const gitInfo = await getGitInfo();
      if (Object.entries(gitInfo).some(([key, value]) => prev?.[key as keyof GitInfo] !== value)) {
        callback(gitInfo, prev);
      }
      prev = gitInfo;
      timer = setTimeout(act, interval);
    } catch (e: any) {
      console.error("getGitInfo failed. Ending loop.", e);
      errorCallback(e);
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
  { configDir, configFile }: { configDir: string; configFile?: string }
) {
  const configuration = await getConfiguration(configFile);
  const { projectId: initialProjectId, projectToken: initialProjectToken } = configuration;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const projectInfoState = useAddonState<ProjectInfoPayload>(channel, PROJECT_INFO);
  projectInfoState.value = initialProjectId
    ? { projectId: initialProjectId, projectToken: initialProjectToken }
    : {};

  let lastProjectToken = initialProjectToken;
  projectInfoState.on("change", async ({ projectId, projectToken }) => {
    if (!projectId || !projectToken) return;
    if (projectToken === lastProjectToken) return;
    lastProjectToken = projectToken;

    const writtenConfigFile = configFile || "chromatic.config.json";
    try {
      await updateChromaticConfig(writtenConfigFile, {
        ...configuration,
        projectId,
        projectToken,
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const localBuildProgress = useAddonState<LocalBuildProgress>(channel, LOCAL_BUILD_PROGRESS);

  channel.on(START_BUILD, async () => {
    const { projectToken } = projectInfoState.value || {};
    await runChromaticBuild(localBuildProgress, { projectToken });
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gitInfoState = useAddonState<GitInfoPayload>(channel, GIT_INFO);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gitInfoError = useAddonState<Error>(channel, GIT_INFO_ERROR);

  observeGitInfo(
    5000,
    (info) => {
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
