/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import type { Channel } from "@storybook/channels";
// eslint-disable-next-line import/no-unresolved
import { Context, getGitInfo, GitInfo, run, TaskName } from "chromatic/node";
import { basename, relative } from "path";

import {
  BUILD_STEP_CONFIG,
  BUILD_STEP_ORDER,
  hasProgressEvent,
  INITIAL_BUILD_PAYLOAD,
  isKnownStep,
} from "./buildSteps";
import {
  CHROMATIC_BASE_URL,
  GIT_INFO,
  PROJECT_INFO,
  RUNNING_BUILD,
  START_BUILD,
} from "./constants";
import { GitInfoPayload, ProjectInfoPayload, RunningBuildPayload } from "./types";
import { useAddonState } from "./useAddonState/server";
import { findConfig } from "./utils/storybook.config.utils";
import { updateMain } from "./utils/updateMain";

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

const getBuildStepData = (
  task: TaskName,
  previousBuildProgress?: RunningBuildPayload["previousBuildProgress"]
) => {
  if (!isKnownStep(task)) throw new Error(`Unknown step: ${task}`);

  const stepDurations = BUILD_STEP_ORDER.map((step) => {
    const { startedAt, completedAt } = previousBuildProgress?.[step] || {};
    return startedAt && completedAt
      ? completedAt - startedAt
      : BUILD_STEP_CONFIG[step].estimateDuration;
  });
  const totalDuration = stepDurations.reduce((sum, duration) => sum + duration, 0);

  const stepIndex = BUILD_STEP_ORDER.indexOf(task);
  const startTime = stepDurations.slice(0, stepIndex).reduce((sum, duration) => sum + duration, 0);
  const endTime = startTime + stepDurations[stepIndex];

  const startPercentage = (startTime / totalDuration) * 100;
  const endPercentage = (endTime / totalDuration) * 100;
  return {
    ...BUILD_STEP_CONFIG[task],
    startPercentage,
    endPercentage,
    stepPercentage: endPercentage - startPercentage,
  };
};

const ESTIMATED_PROGRESS_INTERVAL = 2000;

const onStartOrProgress =
  (runningBuildState: ReturnType<typeof useAddonState<RunningBuildPayload>>) =>
  ({ ...ctx }: Context, { progress, total }: { progress?: number; total?: number } = {}) => {
    if (isKnownStep(ctx.task)) {
      const { buildProgressPercentage, stepProgress, previousBuildProgress } =
        runningBuildState.value;

      const { startPercentage, endPercentage, stepPercentage } = getBuildStepData(
        ctx.task,
        previousBuildProgress
      );

      let newPercentage = startPercentage;
      if (progress && total) {
        newPercentage += stepPercentage * (progress / total);
      }

      // If the step doesn't have a progress event, simulate one by synthetically updating progress
      if (!hasProgressEvent(ctx.task)) {
        const { estimateDuration } = BUILD_STEP_CONFIG[ctx.task];
        const stepIndex = BUILD_STEP_ORDER.indexOf(ctx.task);
        newPercentage =
          Math.max(newPercentage, buildProgressPercentage) +
          (ESTIMATED_PROGRESS_INTERVAL / estimateDuration) * stepPercentage;

        setTimeout(() => {
          // Intentionally reference the present value here (after timeout)
          const { currentStep } = runningBuildState.value;
          if (isKnownStep(currentStep)) {
            const index = BUILD_STEP_ORDER.indexOf(currentStep);
            if (index !== -1 && index <= stepIndex) {
              // Only update if we haven't moved on to a later step
              onStartOrProgress(runningBuildState)(ctx);
            }
          }
        }, ESTIMATED_PROGRESS_INTERVAL);
      }

      stepProgress[ctx.task] = {
        startedAt: Date.now(),
        ...stepProgress[ctx.task],
        ...(progress && total && { numerator: progress, denominator: total }),
      };

      runningBuildState.value = {
        buildId: ctx.announcedBuild?.id,
        buildProgressPercentage: Math.min(newPercentage, endPercentage),
        currentStep: ctx.task,
        stepProgress,
      };
    }
  };

const onCompleteOrError =
  (runningBuildState: ReturnType<typeof useAddonState<RunningBuildPayload>>) =>
  (ctx: Context, error?: { formattedError: string; originalError: Error | Error[] }) => {
    const { buildProgressPercentage, stepProgress } = runningBuildState.value;

    if (isKnownStep(ctx.task)) {
      stepProgress[ctx.task] = {
        ...stepProgress[ctx.task],
        completedAt: Date.now(),
      };
    }

    if (error) {
      runningBuildState.value = {
        buildId: ctx.announcedBuild?.id,
        buildProgressPercentage,
        currentStep: "error",
        stepProgress,
        formattedError: error.formattedError,
        originalError: error.originalError,
        previousBuildProgress: stepProgress,
      };
      return;
    }

    if (ctx.task === "snapshot") {
      runningBuildState.value = {
        buildId: ctx.announcedBuild?.id,
        buildProgressPercentage: 100,
        currentStep: "complete",
        stepProgress,
        changeCount: ctx.build.changeCount,
        errorCount: ctx.build.errorCount,
        previousBuildProgress: stepProgress,
      };
    }
  };

async function serverChannel(
  channel: Channel,
  {
    configDir,
    projectId: initialProjectId,
    projectToken: initialProjectToken,

    // This is a small subset of the flags available to the CLI.
    buildScriptName,
    debug,
    zip,
  }: {
    configDir: string;
    projectId: string;
    projectToken: string;
    buildScriptName?: string;
    debug?: boolean;
    zip?: boolean;
  }
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const projectInfoState = useAddonState<ProjectInfoPayload>(channel, PROJECT_INFO);
  projectInfoState.value = initialProjectId
    ? { projectId: initialProjectId, projectToken: initialProjectToken }
    : {};

  let lastProjectToken = initialProjectToken;
  projectInfoState.on("change", async ({ projectId, projectToken }) => {
    if (projectToken === lastProjectToken) return;
    lastProjectToken = projectToken;

    const relativeConfigDir = relative(process.cwd(), configDir);
    let mainPath: string;
    try {
      mainPath = await findConfig(configDir, "main");
      await updateMain({ mainPath, projectId, projectToken });

      projectInfoState.value = {
        ...projectInfoState.value,
        written: true,
        mainPath: basename(mainPath),
        configDir: relativeConfigDir,
      };
    } catch (err) {
      console.warn(`Failed to update your main configuration:\n\n ${err}`);

      projectInfoState.value = {
        ...projectInfoState.value,
        written: false,
        mainPath: mainPath && basename(mainPath),
        configDir: relativeConfigDir,
      };
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const runningBuildState = useAddonState<RunningBuildPayload>(channel, RUNNING_BUILD);

  channel.on(START_BUILD, async () => {
    if (!projectInfoState.value.projectToken) throw new Error("No project token set");

    runningBuildState.value = INITIAL_BUILD_PAYLOAD;

    await run({
      // Currently we have to have these flags.
      // We should move the checks to after flags have been parsed into options.
      flags: {
        projectToken: projectInfoState.value.projectToken,
        buildScriptName,
        debug,
        zip,
      },
      options: {
        // We might want to drop this later and instead record "uncommitted hashes" on builds
        forceRebuild: true,
        // Builds initiated from the addon are always considered local
        isLocalBuild: true,
        experimental_onTaskStart: onStartOrProgress(runningBuildState),
        experimental_onTaskProgress: onStartOrProgress(runningBuildState),
        experimental_onTaskComplete: onCompleteOrError(runningBuildState),
        experimental_onTaskError: onCompleteOrError(runningBuildState),
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
