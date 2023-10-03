import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { storyWrapper } from "../../utils/graphQLClient";
import { GitNotFound } from "./GitNotFound";

const meta = {
  component: GitNotFound,
  decorators: [storyWrapper],
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof GitNotFound>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
