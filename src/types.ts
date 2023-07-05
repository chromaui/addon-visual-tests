import { BuildFieldsFragment } from "./gql/graphql";

export interface AddonState {
  isOutdated?: boolean;
  isRunning?: boolean;
  lastBuildId?: string;
}

export type AnnouncedBuild = Extract<BuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<BuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<BuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<BuildFieldsFragment, { __typename: "CompletedBuild" }>;
