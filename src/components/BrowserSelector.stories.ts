import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, ComparisonResult } from "../gql/graphql";
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

export const WithSingleViewportChanged: Story = {
  args: {
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportEqual: Story = {
  args: {
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithSingleViewportError: Story = {
  args: {
    browserResults: [
      {
        browser: browserChrome,
        result: ComparisonResult.CaptureError,
      },
    ],
  },
};

export const WithManyViewportsEqual: Story = {
  args: {
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

export const WithManyViewportsVaried: Story = {
  args: {
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
