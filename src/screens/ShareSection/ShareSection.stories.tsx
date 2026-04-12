// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { baseModes } from '../../modes';
import { ShareSectionComplete } from './ShareSectionComplete';
import { ShareSectionError } from './ShareSectionError';
import { ShareSectionIdle } from './ShareSectionIdle';
import { ShareSectionUploading } from './ShareSectionUploading';
import { ShareSectionVerifying } from './ShareSectionVerifying';
import { ShareSectionWelcome } from './ShareSectionWelcome';

// --- Welcome ---

const welcomeMeta = {
  component: ShareSectionWelcome,
  args: {
    onPublish: fn().mockName('onPublish'),
  },
  parameters: {
    chromatic: { modes: baseModes },
  },
} satisfies Meta<typeof ShareSectionWelcome>;

export default welcomeMeta;
type WelcomeStory = StoryObj<typeof welcomeMeta>;

export const Welcome: WelcomeStory = {};

// --- Idle (sign in) ---

type IdleStory = StoryObj<typeof ShareSectionIdle>;

export const Idle: IdleStory = {
  render: (args) => <ShareSectionIdle {...args} />,
  args: {
    onSignIn: fn().mockName('onSignIn'),
  },
};

// --- Verifying ---

type VerifyingStory = StoryObj<typeof ShareSectionVerifying>;

export const Verifying: VerifyingStory = {
  render: (args) => <ShareSectionVerifying {...args} />,
  args: {
    userCode: 'AB12CD',
    onBack: fn().mockName('onBack'),
  },
  parameters: {
    chromatic: { ignoreSelectors: ['ol'] },
  },
};

// --- Uploading (initializing, no URL yet) ---

type UploadingStory = StoryObj<typeof ShareSectionUploading>;

export const UploadingInitializing: UploadingStory = {
  render: (args) => <ShareSectionUploading {...args} />,
  args: {
    step: 'pending',
    onCopy: fn().mockName('onCopy'),
  },
};

// --- Uploading (with progress and URL) ---

export const UploadingWithProgress: UploadingStory = {
  render: (args) => <ShareSectionUploading {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    progress: 42,
    step: 'uploading',
    onCopy: fn().mockName('onCopy'),
  },
};

// --- Complete (just published) ---

type CompleteStory = StoryObj<typeof ShareSectionComplete>;

export const CompleteJustPublished: CompleteStory = {
  render: (args) => <ShareSectionComplete {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    publishedAt: Date.now(),
    isOutdated: false,
    onPublishAgain: fn().mockName('onPublishAgain'),
    onCopy: fn().mockName('onCopy'),
    onDelete: fn().mockName('onDelete'),
  },
};

// --- Complete (with changes / stale) ---

export const CompleteWithChanges: CompleteStory = {
  render: (args) => <ShareSectionComplete {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    publishedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    isOutdated: true,
    onPublishAgain: fn().mockName('onPublishAgain'),
    onCopy: fn().mockName('onCopy'),
    onDelete: fn().mockName('onDelete'),
  },
};

// --- Error (cancelled) ---

type ErrorStory = StoryObj<typeof ShareSectionError>;

export const ErrorCancelled: ErrorStory = {
  render: (args) => <ShareSectionError {...args} />,
  args: {
    reason: 'cancelled',
    onRetry: fn().mockName('onRetry'),
  },
};

// --- Error (expired) ---

export const ErrorExpired: ErrorStory = {
  render: (args) => <ShareSectionError {...args} />,
  args: {
    reason: 'expired',
    onRetry: fn().mockName('onRetry'),
  },
};

// --- Error (unknown) ---

export const ErrorUnknown: ErrorStory = {
  render: (args) => <ShareSectionError {...args} />,
  args: {
    reason: 'unknown',
    onRetry: fn().mockName('onRetry'),
  },
};
