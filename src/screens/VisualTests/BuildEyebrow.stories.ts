import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, fireEvent, within } from 'storybook/test';

import * as buildProgressStories from '../../components/BuildProgressLabel.stories';
import { panelModes } from '../../modes';
import { playAll } from '../../utils/playAll';
import { withFigmaDesign } from '../../utils/withFigmaDesign';
import { BuildEyebrow } from './BuildEyebrow';

const meta = {
  args: {
    branch: 'feature',
    dismissBuildError: fn(),
    switchToLastBuildOnBranch: fn().mockName('switchToLastBuildOnBranch'),
  },
  component: BuildEyebrow,
  parameters: {
    chromatic: {
      modes: panelModes,
    },
  },
} satisfies Meta<typeof BuildEyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

const expandEyebrow = playAll(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole('button');
  await fireEvent.click(button);
});

const dismissEyebrow = playAll(async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole('button');
  await fireEvent.click(button);
  await expect(args.dismissBuildError).toHaveBeenCalled();
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

export const Error: Story = {
  args: buildProgressStories.Error.args,
  parameters: buildProgressStories.Error.parameters,
  play: dismissEyebrow,
};

export const Aborted: Story = {
  args: buildProgressStories.Aborted.args,
  parameters: buildProgressStories.Aborted.parameters,
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
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-448761&mode=design&t=70EtYCn1H7hB8PAk-0'
  ),
};
