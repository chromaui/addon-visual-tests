import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { screen, userEvent } from 'storybook/test';

import { panelModes } from '../../modes';
import { playAll, playSequentially } from '../../utils/playAll';
import { storyWrapper } from '../../utils/storyWrapper';
import { BuildProvider } from './BuildContext';
import { ControlsProvider } from './ControlsContext';
import {
  acceptedTests,
  buildInfo,
  inProgressTests,
  pendingBuild,
  pendingTests,
  withTests,
} from './mocks';
import { ReviewTestProvider } from './ReviewTestContext';
import { Grid } from './SnapshotComparison';
import { SnapshotControls } from './SnapshotControls';

const meta = {
  component: SnapshotControls,
  decorators: [
    storyWrapper(ReviewTestProvider, (ctx) => ({ watchState: ctx.parameters.reviewTest })),
    storyWrapper(BuildProvider, (ctx) => ({ watchState: buildInfo(ctx.parameters.selectedBuild) })),
    storyWrapper(ControlsProvider, () => ({ initialState: { diffVisible: true } })),
    storyWrapper(Grid),
  ],
  args: {
    isOutdated: false,
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    reviewTest: {
      isReviewing: false,
      userCanReview: true,
      buildIsReviewable: true,
      acceptTest: fn().mockName('acceptTest'),
      unacceptTest: fn().mockName('unacceptTest'),
    },
    selectedBuild: withTests(pendingBuild, pendingTests),
  },
} satisfies Meta<typeof SnapshotControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const InProgress = {
  parameters: {
    selectedBuild: withTests(pendingBuild, inProgressTests),
  },
} satisfies Story;

export const Accepting = {
  parameters: {
    reviewTest: {
      ...meta.parameters.reviewTest,
      isReviewing: true,
    },
  },
} satisfies Story;

export const Accepted = {
  parameters: {
    selectedBuild: withTests(pendingBuild, acceptedTests),
  },
} satisfies Story;

export const Unreviewable = {
  parameters: {
    reviewTest: {
      ...meta.parameters.reviewTest,
      buildIsReviewable: false,
    },
  },
} satisfies Story;

export const ToggleDiff = {
  play: playAll(async ({ canvas }) => {
    const button = await canvas.findByRole('switch', { name: 'Hide diff' });
    await userEvent.click(button);
  }),
} satisfies Story;

export const ToggleBaseline = {
  play: playAll(async ({ canvas }) => {
    const button = await canvas.findByRole('button', { name: 'Show baseline snapshot' });
    await userEvent.click(button);
  }),
} satisfies Story;

export const BatchAcceptOptions = {
  play: playSequentially(async ({ canvas }) => {
    await userEvent.keyboard('[Escape]');
    const menu = await canvas.findByRole('button', { name: 'Batch accept options' });
    await userEvent.click(menu);
  }),
} satisfies Story;

export const BatchAcceptedBuild = {
  play: playSequentially(BatchAcceptOptions, async ({ parameters }) => {
    const action = await screen.findByText('Accept entire build');
    await userEvent.click(action);
    await expect(parameters.reviewTest.acceptTest).toHaveBeenCalledWith(
      parameters.selectedBuild.testsForStory.nodes[0].id,
      'BUILD'
    );
  }),
} satisfies Story;
