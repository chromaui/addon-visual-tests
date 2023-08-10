import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { findByTestId } from "@storybook/testing-library";
import { graphql } from "msw";
import React from "react";

import { Build, ProjectQueryQuery, SelectProjectsQueryQuery } from "../../gql/graphql";
import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { LinkedProject } from "./LinkedProject";
import { LinkProject } from "./LinkProject";

const meta = {
  component: LinkProject,
  decorators: [storyWrapper],
  args: {
    onUpdateProject: action("updateProject"),
  },
} satisfies Meta<typeof LinkProject>;

const fewProjects = {
  viewer: {
    accounts: [
      {
        id: "account:123",
        name: "yummly",
        projects: [
          {
            id: "123",
            name: "optics",
            webUrl: "https://www.chromatic.com/builds?appId=123",
            projectToken: "randomcode",
          },
          {
            id: "456",
            name: "design-system",
            webUrl: "https://www.chromatic.com/builds?appId=456",
            projectToken: "randomcode",
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
            projectToken: "randomcode",
          },
        ],
      },
    ],
  },
} satisfies SelectProjectsQueryQuery;

const manyProjects = {
  viewer: {
    accounts: [
      {
        id: "account:123",
        name: "yummly",
        projects: [
          {
            id: "123",
            name: "optics",
            webUrl: "https://www.chromatic.com/builds?appId=123",
            projectToken: "randomcode",
          },
          {
            id: "456",
            name: "design-system",
            webUrl: "https://www.chromatic.com/builds?appId=456",
            projectToken: "randomcode",
          },
          {
            id: "789",
            name: "test-repo",
            webUrl: "https://www.chromatic.com/builds?appId=123",
            projectToken: "randomcode",
          },
          {
            id: "101",
            name: "shapes",
            webUrl: "https://www.chromatic.com/builds?appId=456",
            projectToken: "randomcode",
          },
          {
            id: "102",
            name: "chroma-pets",
            webUrl: "https://www.chromatic.com/builds?appId=123",
            projectToken: "randomcode",
          },
          {
            id: "103",
            name: "addon",
            webUrl: "https://www.chromatic.com/builds?appId=456",
            projectToken: "randomcode",
          },

          {
            id: "104",
            name: "another-app",
            webUrl: "https://www.chromatic.com/builds?appId=123",
            projectToken: "randomcode",
          },
          {
            id: "105",
            name: "below-the-fold",
            webUrl: "https://www.chromatic.com/builds?appId=456",
            projectToken: "randomcode",
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
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4563",
        name: "third corp",
        projects: [
          {
            id: "7893",
            name: "third",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4564",
        name: "fourth corp",
        projects: [
          {
            id: "7894",
            name: "fourth",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4565",
        name: "fifth corp",
        projects: [
          {
            id: "7895",
            name: "fifth",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4566",
        name: "acme corp",
        projects: [
          {
            id: "7896",
            name: "acme",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4567",
        name: "seventh corp",
        projects: [
          {
            id: "7897",
            name: "seven",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
      {
        id: "account:4567",
        name: "below the fold corp",
        projects: [
          {
            id: "7897",
            name: "below",
            webUrl: "https://www.chromatic.com/builds?appId=789",
            projectToken: "randomcode",
          },
        ],
      },
    ],
  },
} satisfies SelectProjectsQueryQuery;

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const withSelectProjectsQuery = (projectResult: SelectProjectsQueryQuery) =>
  withGraphQLQuery("SelectProjectsQuery", (req, res, ctx) => res(ctx.data(projectResult)));

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectProject: Story = {
  parameters: {
    ...withSelectProjectsQuery(fewProjects),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318196&t=3EAIRe8423CpOQWY-4"
    ),
  },
};

export const SelectProjectManyProjects: Story = {
  parameters: {
    ...withSelectProjectsQuery(manyProjects),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4"
    ),
  },
  play: async ({ canvasElement }) => {
    const rightDiv = await findByTestId(canvasElement, "right-list");
    const leftDiv = await findByTestId(canvasElement, "left-list");

    // scroll to the bottom of each div
    await rightDiv.scroll({ top: rightDiv.scrollHeight });
    await leftDiv.scroll({ top: leftDiv.scrollHeight });
  },
};
export const Linked: Story = {
  render: () => (
    <LinkedProject
      projectId="789"
      goToNext={action("goToNext")}
      setAccessToken={action("setAccessToken")}
    />
  ),
  parameters: {
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
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=330-472759&t=3EAIRe8423CpOQWY-4"
    ),
  },
};

export const EmptyNoAccounts: Story = {
  parameters: {
    ...withSelectProjectsQuery({
      viewer: {
        id: "viewer:123",
        name: "John Doe",
        accounts: [],
      },
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4"
    ),
  },
};

export const EmptyNoProjects: Story = {
  parameters: {
    ...withSelectProjectsQuery({
      viewer: {
        id: "viewer:123",
        name: "John Doe",
        accounts: [
          {
            id: "account:123",
            name: "acme corp",
            projects: [],
          },
        ],
      },
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4"
    ),
  },
};

export const Loading: Story = {
  parameters: {
    ...withGraphQLQuery("SelectProjectsQuery", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-317038&mode=design&t=P9IPi8sOGNpjCeNs-4"
    ),
  },
};
