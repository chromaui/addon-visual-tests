import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { ComparisonResult } from "../gql/graphql";
import { ModeSelector } from "./ModeSelector";

const viewport800Px = {
  id: "_800",
  name: "800px",
};
const viewport1200Px = {
  id: "_1200",
  name: "1200px",
};

const meta = {
  component: ModeSelector,
  args: {
    isAccepted: false,
    onSelectMode: action("onSelectMode"),
  },
} satisfies Meta<typeof ModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSingleViewportChanged: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
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
    selectedMode: viewport1200Px,
    modeResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportEqual: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithSingleViewportError: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        viewport: viewport1200Px,
        result: ComparisonResult.CaptureError,
      },
    ],
  },
};

export const WithManyViewportsEqual: Story = {
  args: {
    selectedMode: viewport800Px,
    modeResults: [
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
    selectedMode: viewport1200Px,
    modeResults: [
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
    selectedMode: viewport800Px,
    modeResults: [
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
