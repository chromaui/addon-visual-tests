import type { Meta, StoryObj } from '@storybook/react-vite';
import { API } from 'storybook/manager-api';
import { fn, mocked } from 'storybook/test';

import { IS_OFFLINE, LOCAL_BUILD_PROGRESS, PROJECT_INFO, TEST_PROVIDER_ID } from './constants';
import { ShareProviderRender } from './ShareProviderRender';
import { GraphQLClientProvider } from './utils/graphQLClient';
import { MockChannel } from './utils/MockChannel';
import { storyWrapper } from './utils/storyWrapper';
import { AuthValue, useAuth } from './utils/useAuth';
import { useSharedState } from './utils/useSharedState';
import { getTestProviderStore, useTestProviderStore } from './utils/useTestProviderStore';

const channel = new MockChannel();

const api = {
  getChannel: () => channel,
  getAddonState: fn(),
  setAddonState: fn(),
  on: fn(),
  off: fn(),
  emit: fn(),
} as unknown as API;

const meta = {
  component: ShareProviderRender,
  args: {
    ...api,
    api,
    auth: {
      token: null,
      isOpen: false,
      subdomain: 'www',
      screen: 'welcome',
      exchangeParameters: null,
    } as AuthValue,
    [PROJECT_INFO]: undefined,
    [LOCAL_BUILD_PROGRESS]: undefined,
    [IS_OFFLINE]: false,
  },
  argTypes: {
    auth: { type: 'object', target: 'auth' },
    [TEST_PROVIDER_ID]: {
      control: 'select',
      options: [
        'test-provider-state:pending',
        'test-provider-state:running',
        'test-provider-state:completed',
        'test-provider-state:aborted',
      ],
      target: 'test-provider-store',
    },
    [LOCAL_BUILD_PROGRESS]: { type: 'object', target: 'shared-state' },
    [PROJECT_INFO]: { type: 'object', target: 'shared-state' },
    [IS_OFFLINE]: { type: 'boolean', target: 'shared-state' },
    getAddonState: { type: 'function', target: 'manager-api' },
    setAddonState: { type: 'function', target: 'manager-api' },
    on: { type: 'function', target: 'manager-api' },
    off: { type: 'function', target: 'manager-api' },
    emit: { type: 'function', target: 'manager-api' },
  },
  beforeEach: ({ argsByTarget }) => {
    mocked(useAuth).mockImplementation(() => [
      {
        token: null,
        isOpen: false,
        subdomain: 'www',
        screen: 'welcome',
        exchangeParameters: null,
        ...argsByTarget['auth'].auth,
      },
      fn().mockName(`setAuth`),
    ]);
    mocked(useSharedState).mockImplementation((key: string) => [
      argsByTarget['shared-state'][key],
      fn().mockName(`set:${key}`),
    ]);
    mocked(useTestProviderStore).mockImplementation(
      () => argsByTarget['test-provider-store']?.[TEST_PROVIDER_ID] ?? 'test-provider-state:pending'
    );
    mocked(getTestProviderStore).mockImplementation(() => ({
      getState: () =>
        argsByTarget['test-provider-store']?.[TEST_PROVIDER_ID] ?? 'test-provider-state:pending',
      setState: fn(),
      runWithState: fn(),
      testProviderId: 'test-provider-id',
      onRunAll: fn(),
      onClearAll: fn(),
      settingsChanged: fn(),
    }));
  },
  decorators: [storyWrapper(GraphQLClientProvider)],
} satisfies Meta<typeof ShareProviderRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Setup: Story = {};

export const Login: Story = {
  args: {
    [PROJECT_INFO]: { projectId: '123' },
  },
};

export const Ready: Story = {
  args: {
    ...Login.args,
    auth: { token: 'test-token' },
  },
};

export const Starting: Story = {
  args: {
    ...Ready.args,
    [TEST_PROVIDER_ID]: 'test-provider-state:running',
  },
};

export const Uploading: Story = {
  args: {
    ...Starting.args,
    [LOCAL_BUILD_PROGRESS]: {
      currentStep: 'upload',
      stepProgress: { upload: { numerator: 1_200_000, denominator: 2_300_000 } },
    },
  },
};

export const Verifying: Story = {
  args: {
    ...Uploading.args,
    [LOCAL_BUILD_PROGRESS]: {
      currentStep: 'verify',
    },
  },
};

export const Completed: Story = {
  args: {
    ...Ready.args,
    [TEST_PROVIDER_ID]: 'test-provider-state:succeeded',
    [LOCAL_BUILD_PROGRESS]: {
      currentStep: 'complete',
    },
  },
};

export const Crashed: Story = {
  args: {
    ...Ready.args,
    [TEST_PROVIDER_ID]: 'test-provider-state:crashed',
    [LOCAL_BUILD_PROGRESS]: {
      currentStep: 'error',
    },
  },
};

export const Aborted: Story = {
  args: {
    ...Ready.args,
    [LOCAL_BUILD_PROGRESS]: {
      currentStep: 'aborted',
    },
  },
};

export const Offline: Story = {
  args: {
    ...Ready.args,
    [IS_OFFLINE]: true,
  },
};
