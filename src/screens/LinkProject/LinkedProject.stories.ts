import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";

import { ProjectQueryQuery } from "../../gql/graphql";
import { panelModes } from "../../modes";
import { GraphQLClientProvider } from "../../utils/graphQLClient";
import { storyWrapper } from "../../utils/storyWrapper";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { LinkedProject } from "./LinkedProject";

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const meta = {
  component: LinkedProject,
  args: {
    projectId: "Project:abc123",
    configFile: "chromatic.config.json",
    goToNext: action("goToNext"),
    setAccessToken: action("setAccessToken"),
  },
  decorators: [storyWrapper(GraphQLClientProvider)],
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    ...withGraphQLQuery("ProjectQuery", (req, res, ctx) =>
      res(
        ctx.data({
          project: {
            id: "789",
            name: "acme",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            lastBuild: {
              branch: "main",
              number: 123,
            },
          },
        } satisfies ProjectQueryQuery)
      )
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317094&t=435fylbu7gUQNEgq-4"
    ),
  },
} satisfies Meta<typeof LinkedProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
