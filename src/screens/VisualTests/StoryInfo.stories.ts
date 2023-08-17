import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, TestStatus } from "../../gql/graphql";
import { makeTest, makeTests } from "../../utils/storyData";
import { StoryInfo } from "./StoryInfo";

const meta = {
  component: StoryInfo,
  args: {
    startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    isStarting: false,
    startDevBuild: action("startDevBuild"),
    isOutdated: false,
  },
} satisfies Meta<typeof StoryInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgressUnstarted: Story = {
  args: {
    tests: [],
  },
};

export const InProgress: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.InProgress })],
  },
};

export const Pending: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const Passed: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Passed })],
  },
};

export const PassedOutdated: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Passed })],
    isOutdated: true,
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
