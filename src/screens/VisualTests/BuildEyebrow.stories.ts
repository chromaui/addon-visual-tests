import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { fireEvent, within } from "@storybook/testing-library";

import * as buildProgressStories from "../../components/BuildProgressLabel.stories";
import { screenModes } from "../../modes";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { BuildEyebrow } from "./BuildEyebrow";

const meta = {
  args: {
    branch: "feature",
    switchToLastBuildOnBranch: action("switchToLastBuildOnBranch"),
  },
  component: BuildEyebrow,
  parameters: {
    chromatic: {
      modes: screenModes,
    },
  },
} satisfies Meta<typeof BuildEyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

const expandEyebrow = playAll(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button");
  await fireEvent.click(button);
});

export const Initialize: Story = {
  args: buildProgressStories.Initialize.args,
  parameters: buildProgressStories.Initialize.parameters,
  play: expandEyebrow,
};

export const Build: Story = {
  args: buildProgressStories.Build.args,
  parameters: buildProgressStories.Build.parameters,
  play: expandEyebrow,
};

export const Upload: Story = {
  args: buildProgressStories.Upload.args,
  parameters: buildProgressStories.Upload.parameters,
  play: expandEyebrow,
};

export const Verify: Story = {
  args: buildProgressStories.Verify.args,
  parameters: buildProgressStories.Verify.parameters,
  play: expandEyebrow,
};

export const Snapshot: Story = {
  args: buildProgressStories.Snapshot.args,
  parameters: buildProgressStories.Snapshot.parameters,
  play: expandEyebrow,
};

export const Complete: Story = {
  args: buildProgressStories.Complete.args,
  parameters: buildProgressStories.Complete.parameters,
  play: expandEyebrow,
};

export const NewBuildRunning: Story = {
  args: { lastBuildOnBranchInProgress: true },
};

export const NewerSnapshotAvailable: Story = {};

export const NewerBuildOnBranch: Story = {
  args: {
    switchToLastBuildOnBranch: undefined,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-448761&mode=design&t=70EtYCn1H7hB8PAk-0"
  ),
};
