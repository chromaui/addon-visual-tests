import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { makeComparison, makeTest } from "../../utils/storyData";
import { SnapshotComparison } from "./SnapshotComparison";

const browsers = [Browser.Chrome, Browser.Safari];
const tests = [
  makeTest({
    id: "11",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    comparisons: [
      makeComparison({
        id: "112",
        browser: Browser.Chrome,
        viewport: 800,
        result: ComparisonResult.Changed,
      }),
      makeComparison({
        id: "112",
        browser: Browser.Safari,
        viewport: 800,
        result: ComparisonResult.Equal,
      }),
    ],
    viewport: 800,
    storyId: "button--primary",
  }),
  makeTest({
    id: "12",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers,
    viewport: 1200,
    storyId: "button--primary",
  }),
  makeTest({
    id: "13",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers,
    viewport: 400,
    storyId: "button--primary",
  }),
];

const meta = {
  component: SnapshotComparison,
  args: {
    tests,
    isAccepting: false,
    onAccept: action("onAccept"),
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    tests: tests.map((test) => ({
      ...test,
      status: TestStatus.InProgress,
      result: null,
      comparisons: test.comparisons.map((comparison) => ({
        ...comparison,
        result: null,
        headCapture: null,
        captureDiff: null,
      })),
    })),
  },
};

export const WithMultipleTests: Story = {};

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Saf) is on the
 * "opposite" side of the current comparison (800px/Chrome)
 */
export const WithMultipleTestsFirstPassed: Story = {
  args: {
    tests: [
      makeTest({
        id: "11",
        status: TestStatus.Passed,
        result: TestResult.Equal,
        browsers,
        viewport: 800,
        storyId: "button--primary",
      }),
      makeTest({
        id: "12",
        status: TestStatus.Pending,
        result: TestResult.Changed,
        comparisons: [
          makeComparison({
            id: "112",
            browser: Browser.Chrome,
            viewport: 1200,
            result: ComparisonResult.Equal,
          }),
          makeComparison({
            id: "112",
            browser: Browser.Safari,
            viewport: 1200,
            result: ComparisonResult.Changed,
          }),
        ],
        viewport: 1200,
        storyId: "button--primary",
      }),
    ],
  },
};

export const WithSingleTest: Story = {
  args: {
    tests: [tests[0]],
  },
};

export const WithSingleTestAccepting: Story = {
  args: {
    isAccepting: true,
    tests: [tests[0]],
  },
};

export const WithSingleTestAccepted: Story = {
  args: {
    tests: [
      {
        ...tests[0],
        status: TestStatus.Accepted,
      },
    ],
  },
};
