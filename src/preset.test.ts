import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ADDON_ID,
  PACKAGE_NAME,
  PROJECT_INFO,
  REMOVE_ADDON,
  START_BUILD,
  STOP_BUILD,
  TELEMETRY,
  TEST_PROVIDER_ID,
} from './constants';
import config from './preset';
import { SET_VALUE } from './utils/SharedState';

const mocks = vi.hoisted(() => ({
  onClearAll: vi.fn(),
  runWithState: vi.fn(),
  setState: vi.fn(),
  unset: vi.fn(),
  removeAddon: vi.fn(),
  runChromaticBuild: vi.fn(async () => undefined),
  stopChromaticBuild: vi.fn(),
  telemetry: vi.fn(),
  getConfiguration: vi.fn(async () => ({})),
  getGitInfo: vi.fn(async () => ({})),
}));

vi.mock('chromatic/node', () => ({
  createLogger: vi.fn(() => ({})),
  getConfiguration: mocks.getConfiguration,
  getGitInfo: mocks.getGitInfo,
}));

vi.mock('./runChromaticBuild.ts', () => ({
  runChromaticBuild: mocks.runChromaticBuild,
  stopChromaticBuild: mocks.stopChromaticBuild,
}));

vi.mock('storybook/internal/core-server', () => ({
  experimental_getTestProviderStore: vi.fn(() => ({
    onClearAll: mocks.onClearAll,
    runWithState: mocks.runWithState,
    setState: mocks.setState,
  })),
}));

vi.mock('storybook/internal/telemetry', () => ({
  telemetry: mocks.telemetry,
}));

vi.mock('storybook/manager-api', () => ({
  experimental_getStatusStore: vi.fn(() => ({
    unset: mocks.unset,
  })),
}));

type Listener = (...args: unknown[]) => void;
type ServerChannel = NonNullable<typeof config.experimental_serverChannel>;
type ServerChannelChannel = Parameters<ServerChannel>[0];
type ServerChannelOptions = Parameters<ServerChannel>[1];

const createChannel = () => {
  const listeners = new Map<string, Listener[]>();

  return {
    on: vi.fn((event: string, listener: Listener) => {
      listeners.set(event, [...(listeners.get(event) || []), listener]);
    }),
    off: vi.fn((event: string, listener: Listener) => {
      listeners.set(
        event,
        (listeners.get(event) || []).filter((existingListener) => existingListener !== listener)
      );
    }),
    emit: vi.fn((event: string, ...args: unknown[]) => {
      for (const listener of listeners.get(event) || []) listener(...args);
    }),
  };
};

const createOptions = ({ disableTelemetry = false } = {}): ServerChannelOptions =>
  ({
    configDir: '.storybook',
    presets: {
      apply: vi.fn((key: string) => {
        if (key === 'experimental_serverAPI') {
          return Promise.resolve({ removeAddon: mocks.removeAddon });
        }
        if (key === 'core') {
          return Promise.resolve({ disableTelemetry });
        }
        return Promise.resolve({});
      }),
    },
  }) as unknown as ServerChannelOptions;

const setupServerChannel = async (options = createOptions()) => {
  const channel = createChannel();
  await config.experimental_serverChannel(channel as unknown as ServerChannelChannel, options);
  return channel;
};

const waitForTelemetryCall = async () => {
  for (let attempts = 0; attempts < 20 && mocks.telemetry.mock.calls.length === 0; attempts += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

describe('preset experimental_serverChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConfiguration.mockResolvedValue({});
    mocks.getGitInfo.mockResolvedValue({});
    mocks.runWithState.mockImplementation(async (callback: () => Promise<unknown>) => callback());
  });

  it('initializes project info and requests required stores', async () => {
    mocks.getConfiguration.mockResolvedValue({ projectId: 'project-123' });
    const channel = await setupServerChannel();

    const { experimental_getStatusStore } = await import('storybook/manager-api');
    const { experimental_getTestProviderStore } = await import('storybook/internal/core-server');

    expect(experimental_getStatusStore).toHaveBeenCalledWith(ADDON_ID);
    expect(experimental_getTestProviderStore).toHaveBeenCalledWith(TEST_PROVIDER_ID);
    expect(channel.emit).toHaveBeenCalledWith(
      SET_VALUE,
      PROJECT_INFO,
      { projectId: 'project-123' },
      expect.any(Number)
    );

    channel.emit(REMOVE_ADDON);
  });

  it('clears all statuses when the test provider clear-all callback runs', async () => {
    const channel = await setupServerChannel();

    expect(mocks.onClearAll).toHaveBeenCalledWith(expect.any(Function));
    const clearAllCallback = mocks.onClearAll.mock.calls[0][0] as () => void;

    clearAllCallback();

    expect(mocks.unset).toHaveBeenCalledTimes(1);

    channel.emit(REMOVE_ADDON);
  });

  it('starts a Chromatic build with the current project and access token', async () => {
    mocks.getConfiguration.mockResolvedValue({ projectId: 'project-123' });
    const channel = await setupServerChannel();

    channel.emit(START_BUILD, { accessToken: 'user-token' });
    await Promise.resolve();

    expect(mocks.runWithState).toHaveBeenCalledTimes(1);
    expect(mocks.runChromaticBuild).toHaveBeenCalledWith(expect.any(Object), {
      configFile: undefined,
      projectId: 'project-123',
      userToken: 'user-token',
    });

    channel.emit(REMOVE_ADDON);
  });

  it('marks the build succeeded and aborts when STOP_BUILD is received', async () => {
    const channel = await setupServerChannel();

    channel.emit(STOP_BUILD);

    expect(mocks.setState).toHaveBeenCalledWith('test-provider-state:succeeded');
    expect(mocks.stopChromaticBuild).toHaveBeenCalledTimes(1);

    channel.emit(REMOVE_ADDON);
  });

  it('forwards telemetry events when telemetry is enabled', async () => {
    const channel = await setupServerChannel(createOptions({ disableTelemetry: false }));

    channel.emit(TELEMETRY, { eventType: 'clicked-run' });
    await waitForTelemetryCall();

    expect(mocks.telemetry).toHaveBeenCalledWith(
      'addon-visual-tests',
      expect.objectContaining({ eventType: 'clicked-run' })
    );

    channel.emit(REMOVE_ADDON);
  });

  it('does not forward telemetry when telemetry is disabled', async () => {
    const channel = await setupServerChannel(createOptions({ disableTelemetry: true }));

    channel.emit(TELEMETRY, { eventType: 'clicked-run' });
    await Promise.resolve();

    expect(mocks.telemetry).not.toHaveBeenCalled();

    channel.emit(REMOVE_ADDON);
  });

  it('removes the addon when REMOVE_ADDON is received', async () => {
    const channel = await setupServerChannel();

    channel.emit(REMOVE_ADDON);
    await Promise.resolve();

    expect(mocks.removeAddon).toHaveBeenCalledWith(PACKAGE_NAME);
  });
});
