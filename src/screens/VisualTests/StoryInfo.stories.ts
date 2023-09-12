import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, TestStatus } from "../../gql/graphql";
import { makeTest, makeTests } from "../../utils/storyData";
import { StoryInfo } from "./StoryInfo";

const meta = {
  component: StoryInfo,
  args: {
    isStarting: false,
    startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    startDevBuild: action("startDevBuild"),
    isStorySuperseded: false,
    isBuildFailed: false,
  },
} satisfies Meta<typeof StoryInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Starting: Story = {
  args: { isStarting: true, startedAt: null },
};

// Announced -> Prepared are indistiguishable from Starting currently
export const Announced: Story = {
  args: { isStarting: true, startedAt: null },
};

// The build hasn't start properly yet but is already superseded by another build
export const AnnouncedSuperseded: Story = {
  ...Announced,
  args: {
    ...Announced.args,
    isStorySuperseded: true,
    switchToNextBuild: action("switchToNextBuild"),
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
    isStorySuperseded: true,
    switchToNextBuild: action("switchToNextBuild"),
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
    isStorySuperseded: true,
    switchToNextBuild: action("switchToNextBuild"),
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
