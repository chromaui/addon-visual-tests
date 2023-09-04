import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { ComparisonResult } from "../gql/graphql";
import { ViewportSelector } from "./ViewportSelector";

const viewport800Px = {
  id: "_800",
  name: "800px",
};
const viewport1200Px = {
  id: "_1200",
  name: "1200px",
};

const meta = {
  component: ViewportSelector,
  args: {
    isAccepted: false,
    onSelectViewport: action("onSelectViewport"),
  },
} satisfies Meta<typeof ViewportSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSingleViewportChanged: Story = {
  args: {
    selectedViewport: viewport1200Px,
    viewportResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportAccepted: Story = {
  args: {
    isAccepted: true,
    selectedViewport: viewport1200Px,
    viewportResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportEqual: Story = {
  args: {
    selectedViewport: viewport1200Px,
    viewportResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithSingleViewportError: Story = {
  args: {
    selectedViewport: viewport1200Px,
    viewportResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.CaptureError,
      },
    ],
  },
};

export const WithManyViewportsEqual: Story = {
  args: {
    selectedViewport: viewport800Px,
    viewportResults: [
      {
        viewport: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithManyViewportsSecondSelected: Story = {
  args: {
    selectedViewport: viewport1200Px,
    viewportResults: [
      {
        viewport: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithManyViewportsVaried: Story = {
  args: {
    selectedViewport: viewport800Px,
    viewportResults: [
      {
        viewport: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};
