import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult, TestStatus } from "../gql/graphql";
import { BrowserSelector } from "./BrowserSelector";

const meta = {
  component: BrowserSelector,
  args: {
    onSelectBrowser: action("onSelectBrowser"),
  },
} satisfies Meta<typeof BrowserSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const browserChrome = {
  id: "_chrome",
  key: Browser.Chrome,
  name: "Chrome",
};
const browserSafari = {
  id: "_safari",
  key: Browser.Safari,
  name: "Safari",
};

export const WithSingleBrowserChanged: Story = {
  args: {
    testStatus: TestStatus.Pending,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleBrowserAccepted: Story = {
  args: {
    testStatus: TestStatus.Accepted,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleBrowserEqual: Story = {
  args: {
    testStatus: TestStatus.Passed,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithSingleBrowserError: Story = {
  args: {
    testStatus: TestStatus.Broken,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.CaptureError,
      },
    ],
  },
};

export const WithManyBrowsersEqual: Story = {
  args: {
    testStatus: TestStatus.Passed,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Equal,
      },
      {
        browser: browserSafari,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithManyBrowsersSecondSelected: Story = {
  args: {
    testStatus: TestStatus.Passed,
    selectedBrowser: browserSafari,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Equal,
      },
      {
        browser: browserSafari,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithManyBrowsersVaried: Story = {
  args: {
    testStatus: TestStatus.Pending,
    selectedBrowser: browserChrome,
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Changed,
      },
      {
        browser: browserSafari,
        result: ComparisonResult.Equal,
      },
    ],
  },
};
