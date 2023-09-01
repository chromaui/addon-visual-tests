import type { Meta, StoryObj } from "@storybook/react";

import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { BuildProgress } from "./BuildProgress";

const meta = {
  component: BuildProgress,
} satisfies Meta<typeof BuildProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initialize: Story = {
  args: {
    runningBuild: {
      step: "initialize",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-353260&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Build: Story = {
  args: {
    runningBuild: {
      step: "build",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-353260&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Upload: Story = {
  args: {
    runningBuild: {
      step: "upload",
      progress: 500,
      total: 1000,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-370243&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Verify: Story = {
  args: {
    runningBuild: {
      step: "verify",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-371149&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Snapshot: Story = {
  args: {
    runningBuild: {
      step: "snapshot",
      progress: 25,
      total: 50,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-373686&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Complete: Story = {
  args: {
    runningBuild: {
      step: "complete",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-375342&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};
