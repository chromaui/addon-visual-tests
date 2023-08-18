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
    isOutdated: false,
    isBuildFailed: false,
  },
} satisfies Meta<typeof StoryInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Starting: Story = {};

// Announced -> Prepared are indistiguishable from Starting currently
export const Announced: Story = {};

// The build failed before the test had stories
export const FailedAnnounced: Story = {
  args: { isBuildFailed: true },
};

export const InProgress: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.InProgress })],
  },
};

export const InProgressOutdated: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.InProgress })],
    isOutdated: true,
  },
};

export const Pending: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const PendingOutdated: Story = {
  ...Pending,
  args: {
    ...Pending.args,
    isOutdated: true,
  },
};

export const PendingOutdatedStarting: Story = {
  ...PendingOutdated,
  args: {
    ...PendingOutdated.args,
    isStarting: true,
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