import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";

import { Build, ProjectQueryQuery, SelectProjectsQueryQuery } from "../../gql/graphql";
import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { LinkProject } from "./LinkProject";

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});
const withProjectQuery = () =>
  withGraphQLQuery("LastBuild", (req, res, ctx) =>
    res(
      ctx.data({
        project: {
          id: "123",
          name: "acme",
          webUrl: "https://www.chromatic.com/builds?appId=123",
        },
      } satisfies ProjectQueryQuery)
    )
  );
const withSelectProjectsQuery = () =>
  withGraphQLQuery("SelectProjectsQueryQuery", (req, res, ctx) =>
    res(
      ctx.data({
        accounts: [{
          id: "account:123",
          name: "acme corp",
          projects: [
            {
              id: "123",
              name: "acme",
              webUrl: "https://www.chromatic.com/builds?appId=123",
            },
          ],
        }
        ]
      } satisfies SelectProjectsQueryQuery)
    )
  );

const meta = {
  component: LinkProject,
  decorators: [storyWrapper],
  args: {
    setProjectId: action("setProjectId"),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query("SelectProjectsQuery", (req, res, ctx) => res(
          ctx.data({
            accounts: [{
              id: "account:123",
              name: "acme corp",
              projects: [
                {
                  id: "123",
                  name: "acme",
                  webUrl: "https://www.chromatic.com/builds?appId=123",
                },
              ],
            }
            ]
          } satisfies SelectProjectsQueryQuery)
        )),
        graphql.query("ProjectQuery", (req, res, ctx) =>
          res(
            ctx.data({
              project: {
                id: "123",
                name: "acme",
                webUrl: "https://www.chromatic.com/builds?appId=123",
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
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=330-472759&t=3EAIRe8423CpOQWY-4"
    ),
  }
};
