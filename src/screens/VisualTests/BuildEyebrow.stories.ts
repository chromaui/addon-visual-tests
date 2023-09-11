import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { BuildEyebrow } from "./BuildEyebrow";

const meta = {
  args: {
    runningBuild: INITIAL_BUILD_PAYLOAD,
    switchToNextBuild: action("switchToNextBuild"),
  },
  component: BuildEyebrow,
} satisfies Meta<typeof BuildEyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initialize: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-353260&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
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
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-353260&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
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
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-370243&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
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
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-371149&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
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
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-373686&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
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
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-375342&mode=design&t=vlcsXN2x67tQaQdy-0"
  ),
};

export const Latest: Story = {
  // Could not find this state in the figma file, but it is in this video: https://chromaticqa.slack.com/archives/C051TQR6QLC/p1692372058786929?thread_ts=1692354384.352659&cid=C051TQR6QLC
  // parameters: withFigmaDesign(
  // ),
};

export const LatestNeedToUpdate: Story = {
  args: {
    switchToNextBuild: undefined,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-448761&mode=design&t=70EtYCn1H7hB8PAk-0"
  ),
};
