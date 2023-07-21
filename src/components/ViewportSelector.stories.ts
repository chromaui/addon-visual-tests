import type { Meta, StoryObj } from "@storybook/react";
import { ComparisonResult } from "../gql/graphql";

import { ViewportSelector } from "./ViewportSelector";
import { action } from "@storybook/addon-actions";

const meta = {
  component: ViewportSelector,
  args: {
    onSelectViewport: action("onSelectViewport"),
  },
} satisfies Meta<typeof ViewportSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const viewport800Px = {
  id: "_800",
  name: "800px",
};
const viewport1200Px = {
  id: "_1200",
  name: "1200px",
};

export const WithSingleViewportChanged: Story = {
  args: {
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

export const WithManyViewportsVaried: Story = {
  args: {
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
