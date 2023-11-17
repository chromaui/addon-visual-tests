import type { Meta, StoryObj } from "@storybook/react";

import { GraphQLClientProvider } from "../../utils/graphQLClient";
import { storyWrapper } from "../../utils/storyWrapper";
import { GitNotFound } from "./GitNotFound";

const meta = {
  component: GitNotFound,
  decorators: [storyWrapper(GraphQLClientProvider)],
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof GitNotFound>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
