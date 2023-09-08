import { TaskName } from "chromatic/node";
import { filesize } from "filesize";

import { KnownStep, RunningBuildPayload } from "./types";

export const isKnownStep = (task: TaskName): task is KnownStep =>
  BUILD_STEP_ORDER.includes(task as KnownStep);

// Note this does not include the "complete" and "error" steps
export const BUILD_STEP_ORDER: KnownStep[] = [
  "initialize",
  "build",
  "upload",
  "verify",
  "snapshot",
];

export const BUILD_STEP_CONFIG: Record<
  RunningBuildPayload["step"],
  {
    key: RunningBuildPayload["step"];
    emoji: string;
    renderName: () => string;
    renderProgress: (payload: RunningBuildPayload) => string;
    renderComplete: () => string;
    weight: number;
  }
> = {
  initialize: {
    key: "initialize",
    emoji: "🚀",
    renderName: () => `Initialize build`,
    renderProgress: () => `Initializing build`,
    renderComplete: () => `Initialized`,
    weight: 5,
  },
  build: {
    key: "build",
    emoji: "🏗",
    renderName: () => `Build Storybook`,
    renderProgress: () => `Building your Storybook...`,
    renderComplete: () => `Storybook built`,
    weight: 35,
  },
  upload: {
    key: "upload",
    emoji: "📡",
    renderName: () => `Publish your Storybook`,
    renderProgress: (payload) => {
      if (!payload.stepProgressTotal) return `Uploading files`;
      const { value: total, exponent } = filesize(payload.stepProgressTotal, {
        output: "object",
        round: 1,
      });
      const { value: progress, symbol } = filesize(payload.stepProgressValue, {
        exponent,
        output: "object",
        round: 1,
      });
      return `Uploading files (${progress}/${total} ${symbol})`;
    },
    renderComplete: () => `Publish complete`,
    weight: 15,
  },
  verify: {
    key: "verify",
    emoji: "🔍",
    renderName: () => `Verify your Storybook`,
    renderProgress: () => `Verifying contents...`,
    renderComplete: () => `Storybook verified`,
    weight: 10,
  },
  snapshot: {
    key: "snapshot",
    emoji: "📸",
    renderName: () => `Run visual tests`,
    renderProgress: (payload) =>
      payload.stepProgressTotal
        ? `Running visual tests (${payload.stepProgressValue}/${payload.stepProgressTotal})`
        : `Running visual tests`,
    renderComplete: () => `Tested your stories`,
    weight: 35,
  },

  // These are special steps that are not part of the build process
  complete: {
    key: "complete",
    emoji: "🎉",
    renderName: () => `Visual tests completed!`,
    renderProgress: () => `Visual tests completed!`,
    renderComplete: () => `Visual tests completed!`,
    weight: 0,
  },
  error: {
    key: "error",
    emoji: "🚨",
    renderName: () => `Build failed`,
    renderProgress: () => `Build failed`,
    renderComplete: () => `Build failed`,
    weight: 0,
  },
};
