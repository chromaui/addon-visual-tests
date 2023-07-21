import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { WithSingleBrowserChanged } from "../../components/BrowserSelector.stories";
import { WithSingleViewportChanged } from "../../components/ViewportSelector.stories";
import { SnapshotComparison } from "./SnapshotComparison";

const meta = {
  component: SnapshotComparison,
  args: {
    isAccepting: false,
    isInProgress: false,
    onAccept: action("onAccept"),
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    changeCount: 0,
    isInProgress: true,
    browserResults: [],
    viewportResults: [],
  },
};

export const WithSingleTest: Story = {
  args: {
    changeCount: 1,
    browserResults: WithSingleBrowserChanged.args.browserResults,
    viewportResults: WithSingleViewportChanged.args.viewportResults,
  },
};

export const WithSingleTestAccepting: Story = {
  args: {
    changeCount: 1,
    isAccepting: true,
    browserResults: WithSingleBrowserChanged.args.browserResults,
    viewportResults: WithSingleViewportChanged.args.viewportResults,
  },
};
