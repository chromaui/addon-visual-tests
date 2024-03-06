import type { API } from "@storybook/manager-api";
import type { Configuration, getConfiguration, GitInfo, TaskName } from "chromatic/node";

import { SelectedBuildFieldsFragment } from "./gql/graphql";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var CONFIG_TYPE: string;
}

export type AnnouncedBuild = Extract<SelectedBuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<SelectedBuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<SelectedBuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<SelectedBuildFieldsFragment, { __typename: "CompletedBuild" }>;

export type SelectedBuildWithTests = StartedBuild | CompletedBuild;

export type StoryStatusUpdater = Parameters<API["experimental_updateStatus"]>[1];

export type UpdateStatusFunction = (
  update: StoryStatusUpdater
) => ReturnType<API["experimental_updateStatus"]>;

export type ConfigurationUpdate = {
  // Suggestions adhere to the Configuration schema, but may be null to suggest removal
  [Property in keyof Configuration]: Configuration[Property] | null;
};

export type ConfigInfoPayload = {
  configuration: Awaited<ReturnType<typeof getConfiguration>>;
  problems?: ConfigurationUpdate;
  suggestions?: ConfigurationUpdate;
};
export type GitInfoPayload = Omit<GitInfo, "committerEmail" | "committerName">;

export type ProjectInfoPayload = {
  isProjectInfoLoading?: boolean;
  projectId?: string;
  written?: boolean;
  configFile?: string;
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
  currentStep: KnownStep | "aborted" | "complete" | "error";

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
