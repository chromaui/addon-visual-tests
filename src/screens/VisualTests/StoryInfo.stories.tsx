import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';

import { Browser, TestIgnoreReason, TestStatus } from '../../gql/graphql';
import { panelModes } from '../../modes';
import { makeTest, makeTests } from '../../utils/storyData';
import { Grid } from './SnapshotComparison';
import { StoryInfo } from './StoryInfo';

const meta = {
  component: StoryInfo,
  args: {
    isOutdated: false,
    isStarting: false,
    startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2m ago
    shouldSwitchToLastBuildOnBranch: false,
    isBuildFailed: false,
  },
  decorators: [
    (Story) => (
      <Grid>
        <Story />
      </Grid>
    ),
  ],
  parameters: {
    chromatic: {
      modes: panelModes,
    },
  },
} satisfies Meta<typeof StoryInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Starting: Story = {
  args: { isStarting: true, startedAt: undefined },
};

// Announced -> Prepared are indistiguishable from Starting currently
export const Announced: Story = {
  args: { isStarting: true, startedAt: undefined },
};

// The build hasn't start properly yet but is already superseded by another build
export const AnnouncedSuperseded: Story = {
  ...Announced,
  args: {
    ...Announced.args,
    shouldSwitchToLastBuildOnBranch: true,
    switchToLastBuildOnBranch: fn().mockName('switchToLastBuildOnBranch'),
  },
};

// The build failed before the test had stories
export const FailedAnnounced: Story = {
  args: { isBuildFailed: true },
};

// The build hasn't finished yet but is already superseded by another build
export const InProgress: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.InProgress })],
  },
};

export const InProgressSuperseded: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.InProgress })],
    shouldSwitchToLastBuildOnBranch: true,
    switchToLastBuildOnBranch: fn().mockName('switchToLastBuildOnBranch'),
  },
};

export const Pending: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const PendingSuperseded: Story = {
  ...Pending,
  args: {
    ...Pending.args,
    shouldSwitchToLastBuildOnBranch: true,
    switchToLastBuildOnBranch: fn().mockName('switchToLastBuildOnBranch'),
  },
};

export const Passed: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Passed })],
  },
};

export const Accepted: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Accepted })],
  },
};

export const Broken: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Broken })],
  },
};

// Immediately after clicking run tests in the story above
export const BrokenStarting: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Broken })],
    isStarting: true,
  },
};

// The story itself failed
export const Failed: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Failed })],
  },
};

const ignoredTest = (ignoreReason: TestIgnoreReason, status = TestStatus.Ignored) =>
  makeTest({ status, ignoreReason });

export const Ignored: Story = {
  args: {
    tests: [ignoredTest(TestIgnoreReason.Manual)],
    selectedTest: ignoredTest(TestIgnoreReason.Manual),
  },
};

export const AutoIgnored: Story = {
  args: {
    tests: [ignoredTest(TestIgnoreReason.Unstable)],
    selectedTest: ignoredTest(TestIgnoreReason.Unstable),
  },
};

export const Quarantined: Story = {
  args: {
    tests: [ignoredTest(TestIgnoreReason.Quarantine)],
    selectedTest: ignoredTest(TestIgnoreReason.Quarantine),
  },
};

// A quarantined test that was accepted anyway keeps its badge next to the accepted headline
export const QuarantinedAccepted: Story = {
  args: {
    tests: [ignoredTest(TestIgnoreReason.Quarantine, TestStatus.Accepted)],
    selectedTest: ignoredTest(TestIgnoreReason.Quarantine, TestStatus.Accepted),
  },
};

// The badge describes the selected mode, not the story: a passed mode is selected here so no badge
export const IgnoredOtherModeSelected: Story = {
  args: {
    tests: makeTests({
      viewports: [
        { status: TestStatus.Passed, viewport: 480 },
        { status: TestStatus.Ignored, ignoreReason: TestIgnoreReason.Quarantine, viewport: 800 },
      ],
    }),
  },
  render: (args) => <StoryInfo {...args} selectedTest={args.tests?.[0]} />,
};

export const PendingManyViewportsAndBrowsers: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        { status: TestStatus.Passed, viewport: 480 },
        { status: TestStatus.Pending, viewport: 800 },
        { status: TestStatus.Passed, viewport: 1200 },
      ],
    }),
  },
};
