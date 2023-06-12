import { Meta, StoryObj } from "@storybook/react";
import { graphql } from "msw";

import { storyWrapper } from "../../utils/graphQLClient";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { VisualTests } from "./VisualTests";

const meta = {
  component: VisualTests,
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
} satisfies Meta<typeof VisualTests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoChanges: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Outdated: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const InProgress: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Pending: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Accepted: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
  ),
};
