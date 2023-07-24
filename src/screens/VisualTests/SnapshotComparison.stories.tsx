import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { browser, captureDiff, headCapture, viewport } from "../../utils/storyData";
import { SnapshotComparison } from "./SnapshotComparison";

const tests = [
  {
    id: "11",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    webUrl: "https://www.chromatic.com/test?appId=123&id=11",
    comparisons: [
      {
        id: "111",
        browser: browser(Browser.Chrome),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "112",
        browser: browser(Browser.Safari),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
    ],
    parameters: { viewport: viewport(1200) },
    story: { storyId: "button--primary" },
  },
  {
    id: "12",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    webUrl: "https://www.chromatic.com/test?appId=123&id=12",
    comparisons: [
      {
        id: "121",
        browser: browser(Browser.Chrome),
        viewport: viewport(800),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "122",
        browser: browser(Browser.Safari),
        viewport: viewport(800),
        result: ComparisonResult.Changed,
        headCapture,
        captureDiff,
      },
    ],
    parameters: { viewport: viewport(800) },
    story: { storyId: "button--primary" },
  },
  {
    id: "13",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    webUrl: "https://www.chromatic.com/test?appId=123&id=13",
    comparisons: [
      {
        id: "131",
        browser: browser(Browser.Chrome),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "132",
        browser: browser(Browser.Safari),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
        headCapture,
      },
    ],
    parameters: { viewport: viewport(400) },
    story: { storyId: "button--primary" },
  },
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
