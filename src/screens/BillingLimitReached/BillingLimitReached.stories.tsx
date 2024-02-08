import type { Meta, StoryObj } from "@storybook/react";

import { GraphQLClientProvider } from "../../utils/graphQLClient";
import { storyWrapper } from "../../utils/storyWrapper";
import { BillingLimitReached } from "./BillingLimitReached";

const meta = {
  component: BillingLimitReached,
  decorators: [storyWrapper(GraphQLClientProvider)],
  args: {accountId: 'ab124'},
} satisfies Meta<typeof BillingLimitReached>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
