// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { baseModes } from '../../modes';
import { SharePopupComplete } from './SharePopupComplete';
import { SharePopupError } from './SharePopupError';
import { SharePopupIdle } from './SharePopupIdle';
import { SharePopupSubdomain } from './SharePopupSubdomain';
import { SharePopupUploading } from './SharePopupUploading';
import { SharePopupWelcome } from './SharePopupWelcome';

// --- Welcome ---

const welcomeMeta = {
  component: SharePopupWelcome,
  args: {
    onPublish: fn().mockName('onPublish'),
  },
  parameters: {
    chromatic: { modes: baseModes },
  },
} satisfies Meta<typeof SharePopupWelcome>;

export default welcomeMeta;
type WelcomeStory = StoryObj<typeof welcomeMeta>;

export const Welcome: WelcomeStory = {};

// --- Idle (sign in) ---

type IdleStory = StoryObj<typeof SharePopupIdle>;

export const Idle: IdleStory = {
  render: (args) => <SharePopupIdle {...args} />,
  args: {
    onSignIn: fn().mockName('onSignIn'),
    onSignInWithSSO: fn().mockName('onSignInWithSSO'),
  },
};

// --- Subdomain (SAML SSO) ---

type SubdomainStory = StoryObj<typeof SharePopupSubdomain>;

export const Subdomain: SubdomainStory = {
  render: (args) => <SharePopupSubdomain {...args} />,
  args: {
    onSubmit: fn().mockName('onSubmit'),
    onBack: fn().mockName('onBack'),
  },
};

// --- Uploading (initializing, no URL yet) ---

type UploadingStory = StoryObj<typeof SharePopupUploading>;

export const UploadingInitializing: UploadingStory = {
  render: (args) => <SharePopupUploading {...args} />,
  args: {
    step: 'pending',
    onCopy: fn().mockName('onCopy'),
  },
};

// --- Uploading (with progress and URL) ---

export const UploadingWithProgress: UploadingStory = {
  render: (args) => <SharePopupUploading {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    step: 'uploading',
    onCopy: fn().mockName('onCopy'),
  },
};

// --- Complete (just published) ---

type CompleteStory = StoryObj<typeof SharePopupComplete>;

export const CompleteJustPublished: CompleteStory = {
  render: (args) => <SharePopupComplete {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    publishedAt: Date.now(),
    daysToExpire: 7,
    isOutdated: false,
    onPublishAgain: fn().mockName('onPublishAgain'),
    onCopy: fn().mockName('onCopy'),
    onDelete: fn().mockName('onDelete'),
  },
};

// --- Complete (without expiry info) ---

export const CompleteWithoutExpiry: CompleteStory = {
  render: (args) => <SharePopupComplete {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    publishedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    isOutdated: false,
    onPublishAgain: fn().mockName('onPublishAgain'),
    onCopy: fn().mockName('onCopy'),
    onDelete: fn().mockName('onDelete'),
  },
};

// --- Complete (with changes / stale) ---

export const CompleteWithChanges: CompleteStory = {
  render: (args) => <SharePopupComplete {...args} />,
  args: {
    shareUrl: 'https://64e2e5e6ad08a7e515c54b37-abcdefghij.chromatic.com',
    publishedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    daysToExpire: 7,
    isOutdated: true,
    onPublishAgain: fn().mockName('onPublishAgain'),
    onCopy: fn().mockName('onCopy'),
    onDelete: fn().mockName('onDelete'),
  },
};

// --- Error ---

type ErrorStory = StoryObj<typeof SharePopupError>;

export const ErrorUploadCancelled: ErrorStory = {
  render: (args) => <SharePopupError {...args} />,
  args: {
    reason: 'upload-canceled',
    onRetry: fn().mockName('onRetry'),
  },
};

export const ErrorUnknown: ErrorStory = {
  render: (args) => <SharePopupError {...args} />,
  args: {
    reason: 'unknown',
    onRetry: fn().mockName('onRetry'),
  },
};
