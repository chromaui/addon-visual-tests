import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult, TestStatus } from "../../gql/graphql";
import { makeTest, makeTests } from "../../utils/storyData";
import { SnapshotComparison } from "./SnapshotComparison";

const meta = {
  component: SnapshotComparison,
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        {
          status: TestStatus.Pending,
          viewport: 480,
          comparisonResults: [ComparisonResult.Changed, ComparisonResult.Equal],
        },
        { status: TestStatus.Passed, viewport: 800 },
        { status: TestStatus.Passed, viewport: 1200 },
      ],
    }),
    isAccepting: false,
    onAccept: action("onAccept"),
    baselineImageVisible: false,
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        { status: TestStatus.InProgress, viewport: 480 },
        { status: TestStatus.InProgress, viewport: 800 },
        { status: TestStatus.InProgress, viewport: 1200 },
      ],
    }),
  },
};

export const WithMultipleTests: Story = {};

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Saf) is on the
 * "opposite" side of the current comparison (800px/Chrome)
 */
export const WithMultipleTestsFirstPassed: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        { status: TestStatus.Passed, viewport: 800 },
        {
          status: TestStatus.Pending,
          viewport: 1200,
          comparisonResults: [ComparisonResult.Equal, ComparisonResult.Changed],
        },
      ],
    }),
  },
};

export const WithSingleTest: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const WithSingleTestAccepting: Story = {
  args: {
    isAccepting: true,
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const WithSingleTestAccepted: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Accepted })],
  },
};
