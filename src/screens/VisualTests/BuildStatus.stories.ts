import type { Meta, StoryObj } from "@storybook/react";

import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { BuildStatus } from "./BuildStatus";

const meta = {
  component: BuildStatus,
} satisfies Meta<typeof BuildStatus>;

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
