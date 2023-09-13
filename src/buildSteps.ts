// eslint-disable-next-line import/no-unresolved
import { TaskName } from "chromatic/node";
import { filesize } from "filesize";

import { KnownStep, RunningBuildPayload, StepProgressPayload } from "./types";

export const isKnownStep = (
  taskOrStep: TaskName | RunningBuildPayload["currentStep"]
): taskOrStep is KnownStep => BUILD_STEP_ORDER.includes(taskOrStep as KnownStep);

// Note this does not include the "complete" and "error" steps
export const BUILD_STEP_ORDER: KnownStep[] = [
  "initialize",
  "build",
  "upload",
  "verify",
  "snapshot",
];

export const BUILD_STEP_CONFIG: Record<
  RunningBuildPayload["currentStep"],
  {
    key: RunningBuildPayload["currentStep"];
    emoji: string;
    renderName: () => string;
    renderProgress: (payload: RunningBuildPayload) => string;
    renderComplete: () => string;
    estimateDuration: number;
  }
> = {
  initialize: {
    key: "initialize",
    emoji: "🚀",
    renderName: () => `Initialize build`,
    renderProgress: () => `Initializing build`,
    renderComplete: () => `Initialized`,
    estimateDuration: 2000,
  },
  build: {
    key: "build",
    emoji: "🏗",
    renderName: () => `Build Storybook`,
    renderProgress: () => `Building your Storybook...`,
    renderComplete: () => `Storybook built`,
    estimateDuration: 30_000,
  },
  upload: {
    key: "upload",
    emoji: "📡",
    renderName: () => `Publish your Storybook`,
    renderProgress: ({ stepProgress }) => {
      const { numerator, denominator } = stepProgress.upload;
      if (!denominator) return `Uploading files`;
      const { value: total, exponent } = filesize(denominator, {
        output: "object",
        round: 1,
      });
      const { value: progress, symbol } = filesize(numerator, {
        exponent,
        output: "object",
        round: 1,
      });
      return `Uploading files (${progress}/${total} ${symbol})`;
    },
    renderComplete: () => `Publish complete`,
    estimateDuration: 30_000,
  },
  verify: {
    key: "verify",
    emoji: "🔍",
    renderName: () => `Verify your Storybook`,
    renderProgress: () => `Verifying contents...`,
    renderComplete: () => `Storybook verified`,
    estimateDuration: 10_000,
  },
  snapshot: {
    key: "snapshot",
    emoji: "📸",
    renderName: () => `Run visual tests`,
    renderProgress: ({ stepProgress }) => {
      const { numerator, denominator } = stepProgress.snapshot;
      return denominator
        ? `Running visual tests (${numerator}/${denominator})`
        : `Running visual tests`;
    },
    renderComplete: () => `Tested your stories`,
    estimateDuration: 60_000,
  },

  // These are special steps that are not part of the build process
  complete: {
    key: "complete",
    emoji: "🎉",
    renderName: () => `Visual tests completed!`,
    renderProgress: () => `Visual tests completed!`,
    renderComplete: () => `Visual tests completed!`,
    estimateDuration: 0,
  },
  error: {
    key: "error",
    emoji: "🚨",
    renderName: () => `Build failed`,
    renderProgress: () => `Build failed`,
    renderComplete: () => `Build failed`,
    estimateDuration: 0,
  },
};

export const INITIAL_BUILD_PAYLOAD = {
  buildProgressPercentage: 0,
  currentStep: BUILD_STEP_ORDER[0],
  stepProgress: Object.fromEntries(BUILD_STEP_ORDER.map((step) => [step, {}])) as Record<
    KnownStep,
    StepProgressPayload
  >,
};
