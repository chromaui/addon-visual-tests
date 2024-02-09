// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from "@storybook/react";

import { GitNotFound } from "./GitNotFound";

const meta = {
  component: GitNotFound,
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof GitNotFound>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
