import type { Meta, StoryObj } from "@storybook/react";

import { INITIAL_BUILD_PAYLOAD } from "../buildSteps";
import {
  buildStep,
  completeStep,
  initializeStep,
  snapshotStep,
  uploadStep,
  verifyStep,
} from "../screens/VisualTests/mocks";
import { withFigmaDesign } from "../utils/withFigmaDesign";
import { BuildProgressLabel } from "./BuildProgressLabel";

const meta = {
  component: BuildProgressLabel,
} satisfies Meta<typeof BuildProgressLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initialize: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      stepProgress: initializeStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-73423&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Build: Story = {
  args: {
    localBuildProgress: {
      ...Initialize.args.localBuildProgress,
      buildProgressPercentage: 8,
      currentStep: "build",
      stepProgress: buildStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-73453&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Upload: Story = {
  args: {
    localBuildProgress: {
      ...Build.args.localBuildProgress,
      buildProgressPercentage: 25,
      currentStep: "upload",
      stepProgress: uploadStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2935-71430&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Verify: Story = {
  args: {
    localBuildProgress: {
      ...Upload.args.localBuildProgress,
      buildProgressPercentage: 50,
      currentStep: "verify",
      stepProgress: verifyStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2935-72020&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Snapshot: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 75,
      currentStep: "snapshot",
      stepProgress: snapshotStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-74603&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Complete: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "complete",
      buildProgressPercentage: 100,
      stepProgress: completeStep,
    },
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2892-74801&mode=design&t=gIM40WT0324ynPQD-4",
  ),
};

export const Error: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "error",
      buildProgressPercentage: 30,
      stepProgress: buildStep,
    },
  },
};

export const Aborted: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "aborted",
      buildProgressPercentage: 50,
      stepProgress: uploadStep,
    },
  },
};
