import type { Meta, StoryObj } from '@storybook/react-vite';

import { InvalidProjectId } from './InvalidProjectId';

const meta = {
  component: InvalidProjectId,
  args: {
    configFile: 'chromatic.config.json',
  },
} satisfies Meta<typeof InvalidProjectId>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Invalid: Story = {
  args: {
    projectId: 'invalid-id',
  },
};

export const ProjectToken: Story = {
  args: {
    projectId: 'chpt_abc123def4567',
  },
};
