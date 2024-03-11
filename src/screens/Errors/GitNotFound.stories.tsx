import type { Meta, StoryObj } from "@storybook/react";

import { GitNotFound } from "./GitNotFound";

const meta = {
  component: GitNotFound,
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof GitNotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
