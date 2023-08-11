// eslint-disable-next-line import/no-unresolved
import { GitInfo } from "chromatic/node";

import { BuildFieldsFragment } from "./gql/graphql";

export interface AddonState {
  isOutdated?: boolean;
  isRunning?: boolean;
  lastBuildId?: string;
  gitInfo?: GitInfo;
}

export type AnnouncedBuild = Extract<BuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<BuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<BuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<BuildFieldsFragment, { __typename: "CompletedBuild" }>;

export type BuildWithTests = StartedBuild | CompletedBuild;
