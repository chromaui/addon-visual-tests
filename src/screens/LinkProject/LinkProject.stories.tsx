import type { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";

import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { LinkProject } from "./LinkProject";

const meta = {
  component: LinkProject,
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
                webUrl: "https://www.chromatic.com/builds?appId=123",
                lastBuild: {
                  branch: "main",
                  number: 123,
                },
              },
            })
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
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=330-472759&t=3EAIRe8423CpOQWY-4"
  ),
};
