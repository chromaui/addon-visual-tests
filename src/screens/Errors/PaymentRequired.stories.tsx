import type { Meta, StoryObj } from "@storybook/react";

import { PaymentRequired } from "./PaymentRequired";

const meta = {
  component: PaymentRequired,
  args: {
    billingUrl: "https://www.chromatic.com/billing?accountId=5af25af03c9f2c4bdccc0fcb",
  },
} satisfies Meta<typeof PaymentRequired>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
