import type { API } from "@storybook/manager-api";

import { BuildFieldsFragment } from "./gql/graphql";

export type AnnouncedBuild = Extract<BuildFieldsFragment, { __typename: "AnnouncedBuild" }>;
export type PublishedBuild = Extract<BuildFieldsFragment, { __typename: "PublishedBuild" }>;
export type StartedBuild = Extract<BuildFieldsFragment, { __typename: "StartedBuild" }>;
export type CompletedBuild = Extract<BuildFieldsFragment, { __typename: "CompletedBuild" }>;

export type BuildWithTests = StartedBuild | CompletedBuild;

export type StoryStatusUpdater = Parameters<API["experimental_updateStatus"]>[1];

export type UpdateStatusFunction = (
  update: StoryStatusUpdater
) => ReturnType<API["experimental_updateStatus"]>;
