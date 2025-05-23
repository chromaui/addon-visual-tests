import type { Meta, StoryObj } from '@storybook/react-vite';

import { GitError } from './GitError';

const meta = {
  component: GitError,
} satisfies Meta<typeof GitError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotInitialized: Story = {
  args: {
    gitInfoError: new Error(`
      Unable to execute command: git rev-parse --abbrev-ref HEAD
      Chromatic only works from inside a Git repository.

      You can initialize a new Git repository with \`git init\`.
    `),
  },
};

export const NoCommit: Story = {
  args: {
    gitInfoError: new Error(`
      Unable to execute command: git --no-pager log -n 1 --format="%H ## %ct ## %ae ## %an"
      Chromatic requires your Git repository to have at least one commit.
    `),
  },
};

export const NoEmail: Story = {
  args: {
    gitInfoError: new Error('Command failed with exit code 1: git config user.email'),
  },
};
