import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Screen } from "./Screen";

const meta = {
  component: Screen,
  args: {
    children: "Hello, world!",
  },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
