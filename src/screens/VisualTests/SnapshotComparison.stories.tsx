import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { makeComparison, makeTest } from "../../utils/storyData";
import { SnapshotComparison } from "./SnapshotComparison";

const browsers = [Browser.Chrome, Browser.Safari];
const tests = [
  makeTest({
    id: "11",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers,
    viewport: 1200,
    storyId: "button--primary",
  }),
  makeTest({
    id: "11",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    comparisons: [
      makeComparison({
        id: "112",
        browser: Browser.Chrome,
        viewport: 800,
        result: ComparisonResult.Equal,
      }),
      makeComparison({
        id: "112",
        browser: Browser.Safari,
        viewport: 800,
        result: ComparisonResult.Changed,
      }),
    ],
    viewport: 800,
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
