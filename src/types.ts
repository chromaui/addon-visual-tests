import type { API } from "@storybook/manager-api";
import type { GitInfo, TaskName } from "chromatic/node";

import { StoryBuildFieldsFragment } from "./gql/graphql";

export type AnnouncedBuild = Extract<StoryBuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<StoryBuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<StoryBuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<StoryBuildFieldsFragment, { __typename: "CompletedBuild" }>;

export type StoryBuildWithTests = StartedBuild | CompletedBuild;

export type StoryStatusUpdater = Parameters<API["experimental_updateStatus"]>[1];

export type UpdateStatusFunction = (
  update: StoryStatusUpdater
) => ReturnType<API["experimental_updateStatus"]>;

export type GitInfoPayload = Omit<GitInfo, "committerEmail" | "committerName">;

export type ProjectInfoPayload = {
  projectId?: string;
  projectToken?: string;
  written?: boolean;
  configDir?: string;
  mainPath?: string;
};

// The CLI may have other steps that we don't respond to, so we just ignore updates
// to those steps and focus on the ones we know.
export type KnownStep = Extract<
  TaskName,
  "initialize" | "build" | "upload" | "verify" | "snapshot"
>;

export type StepProgressPayload = {
  /** Current task progress value (e.g. bytes or snapshots) */
  numerator?: number;
  /** Current task progress total (e.g. bytes or snapshots)  */
  denominator?: number;
  startedAt?: number;
  completedAt?: number;
};

export type RunningBuildPayload = {
  /** The id of the build, available after the initialize step */
  buildId?: string;

  /** Overall percentage of build progress */
  buildProgressPercentage: number;

  // Possibly this should be a type exported by the CLI -- these correspond to tasks
  /** The step of the build process we have reached */
  currentStep: KnownStep | "error" | "complete";

  /** Number of visual changes detected */
  changeCount?: number;

  /** Number of component errors detected */
  errorCount?: number;

  /** The error message formatted to display in CLI */
  formattedError?: string;

  /** The original error without formatting */
  originalError?: Error | Error[];

  /** Progress tracking data for each step */
  stepProgress: Record<KnownStep, StepProgressPayload>;

  /** Progress tracking data from the previous build (if any) */
  previousBuildProgress?: Record<KnownStep, StepProgressPayload>;
};
