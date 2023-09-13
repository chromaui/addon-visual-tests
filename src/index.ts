/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { Context, getConfiguration, getGitInfo, GitInfo, run, TaskName } from "chromatic/node";
import { basename, relative } from "path";

import {
  CHROMATIC_BASE_URL,
  GIT_INFO,
  GitInfoPayload,
  isKnownStep,
  knownSteps,
  PROJECT_INFO,
  ProjectInfoPayload,
  RUNNING_BUILD,
  RunningBuildPayload,
  START_BUILD,
} from "./constants";
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
  callback: (info: GitInfo, prevInfo: GitInfo) => void
) => {
  let prev: GitInfo;
  let timer: NodeJS.Timeout | null = null;
  const act = async () => {
    const gitInfo = await getGitInfo();
    if (Object.entries(gitInfo).some(([key, value]) => prev?.[key as keyof GitInfo] !== value)) {
      callback(gitInfo, prev);
    }
    prev = gitInfo;
    timer = setTimeout(act, interval);
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
  const runningBuildState = useAddonState<RunningBuildPayload>(channel, RUNNING_BUILD);
  channel.on(START_BUILD, async () => {
    if (!projectInfoState.value.projectToken) throw new Error("No project token set");

    const onStartOrProgress = (
      ctx: Context,
      { progress, total }: { progress?: number; total?: number } = {}
    ) => {
      if (isKnownStep(ctx.task)) {
        let buildProgressPercentage = (knownSteps.indexOf(ctx.task) / knownSteps.length) * 100;
        if (progress && total) {
          buildProgressPercentage += (progress / total) * (100 / knownSteps.length);
        }
        runningBuildState.value = {
          buildId: ctx.announcedBuild?.id,
          buildProgressPercentage,
          step: ctx.task,
          stepProgressValue: progress,
          stepProgressTotal: total,
        };
      }
    };

    runningBuildState.value = { step: "initialize" };
    await run({
      // Currently we have to have these flags.
      // We should move the checks to after flags have been parsed into options.
      flags: {
        projectToken: projectInfoState.value.projectToken,
      },
      options: {
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: true,
        // Builds initiated from the addon are always considered local
        isLocalBuild: true,
        experimental_onTaskStart: onStartOrProgress,
        experimental_onTaskProgress: onStartOrProgress,
        experimental_onTaskComplete(ctx) {
          if (ctx.task === "snapshot") {
            runningBuildState.value = {
              buildId: ctx.announcedBuild?.id,
              buildProgressPercentage: 100,
              step: "complete",
              changeCount: ctx.build.changeCount,
              errorCount: ctx.build.errorCount,
            };
          }
        },
        experimental_onTaskError(ctx, { formattedError, originalError }) {
          runningBuildState.value = {
            buildId: ctx.announcedBuild?.id,
            buildProgressPercentage:
              runningBuildState.value.buildProgressPercentage ??
              knownSteps.indexOf(ctx.task) / knownSteps.length,
            step: "error",
            formattedError,
            originalError,
          };
        },
      },
    });
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gitInfoState = useAddonState<GitInfoPayload>(channel, GIT_INFO);
  observeGitInfo(5000, (info) => {
    gitInfoState.value = info;
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
