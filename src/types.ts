import type { Configuration, getConfiguration, GitInfo, TaskName } from 'chromatic/node';
import { Status } from 'storybook/internal/types';

import { SelectedBuildFieldsFragment } from './gql/graphql';

declare global {
  var CONFIG_TYPE: string;

  var LOGLEVEL: string;
}

export type AnnouncedBuild = Extract<SelectedBuildFieldsFragment, { __typename: 'AnnouncedBuild' }>;
export type PublishedBuild = Extract<SelectedBuildFieldsFragment, { __typename: 'PublishedBuild' }>;
export type StartedBuild = Extract<SelectedBuildFieldsFragment, { __typename: 'StartedBuild' }>;
export type CompletedBuild = Extract<SelectedBuildFieldsFragment, { __typename: 'CompletedBuild' }>;

export type SelectedBuildWithTests = StartedBuild | CompletedBuild;

export type UpdateStatusFunction = (statuses: Status[]) => void;

export type ConfigurationUpdate = {
  // Suggestions adhere to the Configuration schema, but may be null to suggest removal
  [Property in keyof Configuration]: Configuration[Property] | null;
};

export type ConfigInfoPayload = {
  configuration: Awaited<ReturnType<typeof getConfiguration>>;
  problems?: ConfigurationUpdate;
  suggestions?: ConfigurationUpdate;
};
export type GitInfoPayload = Omit<GitInfo, 'committerEmail' | 'committerName'>;

export type ProjectInfoPayload = {
  projectId?: string;
  written?: boolean;
  dismissed?: boolean;
  configFile?: string;
};

// The CLI may have other steps that we don't respond to, so we just ignore updates
// to those steps and focus on the ones we know.
export type KnownStep = Extract<
  TaskName,
  'initialize' | 'build' | 'upload' | 'verify' | 'snapshot'
>;

export type StepProgressPayload = {
  /** Current task progress value (e.g. bytes or snapshots) */
  numerator?: number;
  /** Current task progress total (e.g. bytes or snapshots)  */
  denominator?: number;
  startedAt?: number;
  completedAt?: number;
};

/**
 * A mode is a combination of globals that determine the appearance of a UI. Modes are used by
 * Chromatic to capture multiple snapshots of a story with different global configurations.
 *
 * @see https://www.chromatic.com/docs/modes/
 */
export interface ChromaticMode {
  /** Disable this mode */
  disable?: boolean;
  [key: string]: unknown;
}

export interface ChromaticParameters {
  /**
   * Chromatic configuration
   *
   * @see https://www.chromatic.com/docs/configure/
   */
  chromatic?: {
    /** Remove the addon panel and disable the addon's behavior */
    disable?: boolean;

    /**
     * Disable snapshot capturing for this story
     * @see https://www.chromatic.com/docs/disable-snapshots/
     */
    disableSnapshot?: boolean;

    /**
     * Threshold before a snapshot is considered visually different, between 0 and 1 where 0 is
     * most accurate and 1 is least accurate.
     *
     * @default 0.063
     * @see https://www.chromatic.com/docs/threshold/
     */
    diffThreshold?: number;

    /**
     * If true, disables detecting and ignoring anti-aliased pixels.
     *
     * @default false
     * @see https://www.chromatic.com/docs/threshold/
     */
    diffIncludeAntiAliasing?: boolean;

    /**
     * Delay in milliseconds before taking the snapshot.
     *
     * @see https://www.chromatic.com/docs/delay/
     */
    delay?: number;

    /**
     * Crop snapshots to the viewport size.
     *
     * @see https://www.chromatic.com/docs/modes/viewports/#how-does-snapshot-cropping-work-with-viewport-width-and-height
     */
    cropToViewport?: boolean;

    /**
     * Set the `forced-colors` media feature when capturing the story. Use `"active"` to enable
     * forced colors mode, or `"none"` to disable it.
     *
     * @see https://www.chromatic.com/docs/media-features/
     */
    forcedColors?: 'none' | 'active';

    /**
     * Set the media used when capturing the story. Use `"print"` to test print styles.
     *
     * @see https://www.chromatic.com/docs/media-features/
     */
    media?: 'print';

    /**
     * CSS selectors for elements that should be ignored when diffing snapshots. Matching elements
     * will be painted over with a neutral color before comparison.
     *
     * @see https://www.chromatic.com/docs/ignoring-elements/
     */
    ignoreSelectors?: string[];

    /**
     * Reverse CSS animations so snapshots show the end state.
     *
     * @see https://www.chromatic.com/docs/animations/
     */
    pauseAnimationAtEnd?: boolean;

    /**
     * Set the `prefers-reduced-motion` media feature when capturing the story. Use `"reduce"` to
     * enable reduced motion, or `"no-preference"` for default behavior.
     *
     * @see https://www.chromatic.com/docs/media-features/
     */
    prefersReducedMotion?: 'reduce' | 'no-preference';

    /**
     * Modes for testing different global configurations such as themes, viewports, and locales.
     * Each mode is a combination of globals applied to the story for capturing a separate snapshot.
     *
     * @see https://www.chromatic.com/docs/modes/
     */
    modes?: Record<string, ChromaticMode>;

    /**
     * Legacy API for setting viewport widths (in pixels) for a story. Use `modes` instead.
     *
     * @deprecated Use `modes` instead.
     * @see https://www.chromatic.com/docs/modes/viewports/
     */
    viewports?: number[];
  };
}

export interface ChromaticTypes {
  parameters: ChromaticParameters;
}

export type LocalBuildProgress = {
  /** The id of the build, available after the initialize step */
  buildId?: string;

  /**
   * The branch we ran the local build on. We'll hide it if we switch branches.
   * We grab this alongside the buildId when the build is announced.
   */
  branch?: string;

  /** Overall percentage of build progress */
  buildProgressPercentage: number;

  // Possibly this should be a type exported by the CLI -- these correspond to tasks
  /** The step of the build process we have reached */
  currentStep: KnownStep | 'aborted' | 'complete' | 'error' | 'limited';

  /** Number of visual changes detected */
  changeCount?: number;

  /** Number of component errors detected */
  errorCount?: number;

  /** The error message formatted to display in CLI */
  formattedError?: string;

  /** The original error without formatting */
  originalError?: Error | Error[];

  /** URL relevant to the error */
  errorDetailsUrl?: string;

  /** Progress tracking data for each step */
  stepProgress: Record<KnownStep, StepProgressPayload>;

  /** Progress tracking data from the previous build (if any) */
  previousBuildProgress?: Record<KnownStep, StepProgressPayload>;
};
