import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";
import { Project, ProjectQueryQuery } from "src/gql/graphql";

import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { RenderSettings } from "./RenderSettings";

const meta = {
  component: RenderSettings,
  decorators: [storyWrapper],
  parameters: {
    msw: {
      handlers: [
        graphql.query("ProjectQuery", (req, res, ctx) =>
          res(
            ctx.data({
              project: {
                id: "123",
                name: "acme",
                webUrl: "https://www.chromatic.com/passedBuilds?appId=123",
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
} satisfies Meta<typeof RenderSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // build: passedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-525764&t=18c1zI1SMe76dWYk-4"
  ),
};
