// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';

import { panelModes } from '../../modes';
import { LinkingProjectFailed } from './LinkingProjectFailed';

const meta = {
  component: LinkingProjectFailed,
  args: {
    projectId: 'Project:abc123',
    configFile: 'chromatic.config.json',
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
  },
} satisfies Meta<typeof LinkingProjectFailed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomConfig: Story = {
  args: {
    configFile: 'production.chromatic.config.json',
  },
};
