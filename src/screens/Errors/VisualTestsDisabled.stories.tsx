import type { Meta, StoryObj } from "@storybook/react";

import { VisualTestsDisabled } from "./VisualTestsDisabled";

const meta = {
  component: VisualTestsDisabled,
  args: {
    manageUrl: "https://www.chromatic.com/manage?appId=123",
  },
} satisfies Meta<typeof VisualTestsDisabled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
