import type { Meta, StoryObj } from "@storybook/react";

import { GitNotFound as component } from "./GitNotFound";

const meta = {
  component,
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GitNotFound: Story = {};
