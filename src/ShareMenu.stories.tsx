import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ShareMenu } from './ShareMenu';

const meta = {
  component: ShareMenu,
  args: {
    getAddonState: fn(),
    setAddonState: fn(),
    on: fn(),
    off: fn(),
  },
  argTypes: {
    getAddonState: { type: 'function', target: 'manager-api' },
    setAddonState: { type: 'function', target: 'manager-api' },
    on: { type: 'function', target: 'manager-api' },
    off: { type: 'function', target: 'manager-api' },
  },
} satisfies Meta<typeof ShareMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
