/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-unresolved
import { Context, Flags, run, TaskName } from "chromatic/node";

import {
  BUILD_STEP_CONFIG,
  BUILD_STEP_ORDER,
  hasProgressEvent,
  INITIAL_BUILD_PAYLOAD,
  isKnownStep,
} from "./buildSteps";
import { RunningBuildPayload } from "./types";
import { useAddonState } from "./useAddonState/server";

const ESTIMATED_PROGRESS_INTERVAL = 2000;

export const runChromaticBuild = async (
  runningBuildState: ReturnType<typeof useAddonState<RunningBuildPayload>>,
  flags: Flags
) => {
  if (!flags.projectToken) throw new Error("No project token set");

  let timeout: ReturnType<typeof setTimeout>;

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
    const startTime = stepDurations
      .slice(0, stepIndex)
      .reduce((sum, duration) => sum + duration, 0);
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

  const onStartOrProgress = (
    { ...ctx }: Context,
    { progress, total }: { progress?: number; total?: number } = {}
  ) => {
    clearTimeout(timeout);
    if (!isKnownStep(ctx.task)) return;

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

      timeout = setTimeout(() => {
        // Intentionally reference the present value here (after timeout)
        const { currentStep } = runningBuildState.value;
        // Only update if we haven't moved on to a later step
        if (isKnownStep(currentStep) && BUILD_STEP_ORDER.indexOf(currentStep) <= stepIndex) {
          onStartOrProgress(ctx);
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
  };

  const onCompleteOrError = (
    ctx: Context,
    error?: { formattedError: string; originalError: Error | Error[] }
  ) => {
    clearTimeout(timeout);
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

  runningBuildState.value = INITIAL_BUILD_PAYLOAD;

  await run({
    // Currently we have to have these flags.
    // We should move the checks to after flags have been parsed into options.
    flags,
    options: {
      // We might want to drop this later and instead record "uncommitted hashes" on builds
      forceRebuild: true,
      // Builds initiated from the addon are always considered local
      isLocalBuild: true,

      experimental_onTaskStart: onStartOrProgress,
      experimental_onTaskProgress: onStartOrProgress,
      experimental_onTaskComplete: onCompleteOrError,
      experimental_onTaskError: onCompleteOrError,
    },
  });
};
