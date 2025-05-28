import type { Meta, StoryObj } from '@storybook/react-vite';

import { NoNetwork } from './NoNetwork';

const meta = {
  component: NoNetwork,
} satisfies Meta<typeof NoNetwork>;

export default meta;

export const Default = {} satisfies StoryObj<typeof meta>;

export const Offline = {
  args: {
    offline: true,
  },
} satisfies StoryObj<typeof meta>;
