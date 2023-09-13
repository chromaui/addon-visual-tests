import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { fireEvent, within } from "@storybook/testing-library";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { BuildEyebrow } from "./BuildEyebrow";

const meta = {
  args: {
    branch: "feature",
    switchToNextBuild: action("switchToNextBuild"),
  },
  component: BuildEyebrow,
} satisfies Meta<typeof BuildEyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

const expandEyebrow = playAll(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button");
  await fireEvent.click(button);
});

export const Initialize: Story = {
  args: {
    runningBuild: INITIAL_BUILD_PAYLOAD,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-73423&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};

export const Build: Story = {
  args: {
    runningBuild: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 8,
      currentStep: "build",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-73453&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};

export const Upload: Story = {
  args: {
    runningBuild: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 50,
      currentStep: "upload",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        upload: {
          startedAt: Date.now() - 3000,
          numerator: 4_200_000,
          denominator: 123_000_000,
        },
      },
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2935-71430&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};

export const Verify: Story = {
  args: {
    runningBuild: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 75,
      currentStep: "verify",
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2935-72020&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};

export const Snapshot: Story = {
  args: {
    runningBuild: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 90,
      currentStep: "snapshot",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        snapshot: {
          startedAt: Date.now() - 5000,
          numerator: 25,
          denominator: 50,
        },
      },
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-74603&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};

export const Complete: Story = {
  args: {
    runningBuild: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "complete",
      buildProgressPercentage: 100,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-74801&mode=design&t=gIM40WT0324ynPQD-4"
  ),
  play: expandEyebrow,
};
