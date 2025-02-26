import type { Meta, StoryObj } from '@storybook/react';

import { AccountSuspensionReason } from '../../gql/graphql';
import { AccountSuspended } from './AccountSuspended';

const meta = {
  component: AccountSuspended,
  args: {
    billingUrl: 'https://www.chromatic.com/billing?accountId=5af25af03c9f2c4bdccc0fcb',
  },
} satisfies Meta<typeof AccountSuspended>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SnapshotLimitReached: Story = {
  args: {
    suspensionReason: AccountSuspensionReason.ExceededThreshold,
  },
};

export const PaymentRequired: Story = {
  args: {
    suspensionReason: AccountSuspensionReason.PaymentRequired,
  },
};

export const Other: Story = {
  args: {
    suspensionReason: AccountSuspensionReason.Other,
  },
};
