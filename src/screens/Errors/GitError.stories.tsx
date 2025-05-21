import type { Meta, StoryObj } from '@storybook/react-vite';

import { GitError } from './GitError';

const meta = {
  component: GitError,
  args: {
    gitInfoError: new Error('Chromatic only works from inside a Git repository.'),
  },
} satisfies Meta<typeof GitError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoCommit: Story = {
  args: {
    gitInfoError: new Error('Chromatic requires your Git repository to have at least one commit.'),
  },
};
