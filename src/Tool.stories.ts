import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { ToolContent } from "./Tool";

const meta = {
  component: ToolContent,
  args: {
    startBuild: action("startBuild"),
  },
} satisfies Meta<typeof ToolContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isRunning: false,
  },
};

export const IsRunning: Story = {
  args: {
    isRunning: true,
  },
};
