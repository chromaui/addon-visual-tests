import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { Browser, ComparisonResult } from '../gql/graphql';
import { BrowserSelector } from './BrowserSelector';

const meta = {
  component: BrowserSelector,
  args: {
    isAccepted: false,
    onSelectBrowser: action('onSelectBrowser'),
  },
} satisfies Meta<typeof BrowserSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const browserChrome = {
  id: '_chrome',
  key: Browser.Chrome,
  name: 'Chrome',
};
const browserSafari = {
  id: '_safari',
  key: Browser.Safari,
  name: 'Safari',
};

export const WithSingleBrowserChanged: Story = {
  args: {
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
    isAccepted: true,
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
