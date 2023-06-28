import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";
import React from "react";

import { Build, ProjectQueryQuery, SelectProjectsQueryQuery } from "../../gql/graphql";
import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { LinkedProject, LinkProject } from "./LinkProject";

const meta = {
  component: LinkProject,
  decorators: [storyWrapper],
  args: {
    onUpdateProjectId: action("setProjectId"),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query("SelectProjectsQuery", (req, res, ctx) =>
          res(
            ctx.data({
              accounts: [
                {
                  id: "account:123",
                  name: "yummly",
                  projects: [
                    {
                      id: "123",
                      name: "optics",
                      webUrl: "https://www.chromatic.com/builds?appId=123",
                    },
                    {
                      id: "456",
                      name: "design-system",
                      webUrl: "https://www.chromatic.com/builds?appId=456",
                    },
                  ],
                },
                {
                  id: "account:456",
                  name: "acme corp",
                  projects: [
                    {
                      id: "789",
                      name: "acme",
                      webUrl: "https://www.chromatic.com/builds?appId=789",
                    },
                  ],
                },
              ],
            } satisfies SelectProjectsQueryQuery)
          )
        ),
        graphql.query("ProjectQuery", (req, res, ctx) =>
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
      ],
    },
  },
} satisfies Meta<typeof LinkProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318196&t=3EAIRe8423CpOQWY-4"
  ),
};

export const Adding: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318252&t=3EAIRe8423CpOQWY-4"
  ),
};

export const Linked: Story = {
  render: () => <LinkedProject projectId="789" />,
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=330-472759&t=3EAIRe8423CpOQWY-4"
    ),
  },
};
