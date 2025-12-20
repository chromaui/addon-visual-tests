import { TaskName } from 'chromatic/node';
import { formatBytesObject } from './utils/formatBytes';

import { KnownStep, LocalBuildProgress, StepProgressPayload } from './types';

export const isKnownStep = (
  taskOrStep: TaskName | LocalBuildProgress['currentStep']
): taskOrStep is KnownStep => BUILD_STEP_ORDER.includes(taskOrStep as KnownStep);

export const hasProgressEvent = (task: TaskName) => ['upload', 'snapshot'].includes(task);

// Note this does not include the "aborted", "complete" and "error" steps
export const BUILD_STEP_ORDER: KnownStep[] = [
  'initialize',
  'build',
  'upload',
  'verify',
  'snapshot',
];

export const BUILD_STEP_CONFIG: Record<
  LocalBuildProgress['currentStep'],
  {
    key: LocalBuildProgress['currentStep'];
    emoji: string;
    renderName: () => string;
    renderProgress: (payload: LocalBuildProgress) => string;
    renderComplete: () => string;
    estimateDuration: number;
  }
> = {
  initialize: {
    key: 'initialize',
    emoji: '🚀',
    renderName: () => `Initialize build`,
    renderProgress: () => `Initializing build...`,
    renderComplete: () => `Initialized`,
    estimateDuration: 2000,
  },
  build: {
    key: 'build',
    emoji: '🏗',
    renderName: () => `Build Storybook`,
    renderProgress: () => `Building your Storybook...`,
    renderComplete: () => `Storybook built`,
    estimateDuration: 20_000,
  },
  upload: {
    key: 'upload',
    emoji: '📡',
    renderName: () => `Publish your Storybook`,
    renderProgress: ({ stepProgress }) => {
      const { numerator, denominator } = stepProgress.upload;
      if (!denominator || !numerator) return `Uploading files...`;
      const { value: total, exponent } = formatBytesObject(denominator, { round: 1 });
      const { value: progress, symbol } = formatBytesObject(numerator, {
        exponent: exponent,
        round: 1,
      });
      return `Uploading files... ${progress}/${total} ${symbol}`;
    },
    renderComplete: () => `Publish complete`,
    estimateDuration: 20_000,
  },
  verify: {
    key: 'verify',
    emoji: '🔍',
    renderName: () => `Verify your Storybook`,
    renderProgress: () => `Verifying contents...`,
    renderComplete: () => `Storybook verified`,
    estimateDuration: 20_000,
  },
  snapshot: {
    key: 'snapshot',
    emoji: '📸',
    renderName: () => `Run visual tests`,
    renderProgress: ({ stepProgress }) => {
      const { numerator, denominator } = stepProgress.snapshot;
      return denominator
        ? `Running visual tests... ${numerator}/${denominator}`
        : `Running visual tests...`;
    },
    renderComplete: () => `Tested your stories`,
    estimateDuration: 90_000,
  },

  // These are special steps that are not part of the build process
  aborted: {
    key: 'aborted',
    emoji: '✋',
    renderName: () => `Build canceled`,
    renderProgress: () => `Build canceled`,
    renderComplete: () => `Build canceled`,
    estimateDuration: 0,
  },
  complete: {
    key: 'complete',
    emoji: '🎉',
    renderName: () => `Visual tests completed!`,
    renderProgress: () => `Visual tests completed!`,
    renderComplete: () => `Visual tests completed!`,
    estimateDuration: 0,
  },
  error: {
    key: 'error',
    emoji: '🚨',
    renderName: () => `Build failed`,
    renderProgress: () => `Build failed`,
    renderComplete: () => `Build failed`,
    estimateDuration: 0,
  },
  limited: {
    key: 'error',
    emoji: '🚨',
    renderName: () => `Build limited`,
    renderProgress: () => `Build limited`,
    renderComplete: () => `Build limited`,
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

export const INITIAL_BUILD_PAYLOAD_JSON = JSON.stringify(INITIAL_BUILD_PAYLOAD);
