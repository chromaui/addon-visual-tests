import type { API } from "@storybook/manager-api";

import { StoryBuildFieldsFragment } from "./gql/graphql";

export type AnnouncedBuild = Extract<StoryBuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<StoryBuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<StoryBuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<StoryBuildFieldsFragment, { __typename: "CompletedBuild" }>;

export type BuildWithTests = StartedBuild | CompletedBuild;

export type StoryStatusUpdater = Parameters<API["experimental_updateStatus"]>[1];

export type UpdateStatusFunction = (
  update: StoryStatusUpdater
) => ReturnType<API["experimental_updateStatus"]>;
