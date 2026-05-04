import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SHARE_PROGRESS, START_SHARE } from './constants';

// ---- hoisted mocks ----
const mocks = vi.hoisted(() => {
  const shareMock = vi.fn();
  const channelHandlers: Record<string, ((...args: any[]) => void)[]> = {};

  const channel = {
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      channelHandlers[event] = channelHandlers[event] || [];
      channelHandlers[event].push(handler);
    }),
    emit: vi.fn(),
    off: vi.fn(),
  };

  const shareProgressState = { value: undefined as any };

  return { shareMock, channel, channelHandlers, shareProgressState };
});

vi.mock('chromatic/node', () => ({
  share: mocks.shareMock,
  createLogger: vi.fn(() => ({})),
  getConfiguration: vi.fn(async () => ({})),
  getGitInfo: vi.fn(async () => ({
    branch: 'main',
    commit: 'abc',
    committerEmail: '',
    committerName: '',
  })),
}));

vi.mock('storybook/internal/channels', () => ({}));
vi.mock('storybook/internal/core-server', () => ({
  experimental_getTestProviderStore: vi.fn(() => ({
    runWithState: vi.fn(),
    setState: vi.fn(),
  })),
}));
vi.mock('storybook/internal/telemetry', () => ({ telemetry: vi.fn() }));
vi.mock('storybook/internal/types', () => ({}));

vi.mock('./utils/SharedState', () => ({
  SharedState: {
    subscribe: vi.fn((key: string) => {
      if (key.endsWith('shareProgress')) return mocks.shareProgressState;
      return { value: undefined, on: vi.fn(), off: vi.fn() };
    }),
  },
}));

vi.mock('./utils/ChannelFetch', () => ({
  ChannelFetch: { subscribe: vi.fn() },
}));

vi.mock('./runChromaticBuild', () => ({
  runChromaticBuild: vi.fn(),
  stopChromaticBuild: vi.fn(),
}));

vi.mock('./utils/updateChromaticConfig', () => ({
  updateChromaticConfig: vi.fn(),
}));

vi.mock('node:fs', () => ({ watch: vi.fn() }));
vi.mock('node:fs/promises', () => ({ readFile: vi.fn(async () => '{"version":"1.0.0"}') }));
vi.mock('node:module', () => ({
  createRequire: vi.fn(() => (path: string) => path),
}));

// Helper to invoke the START_SHARE handler registered on the channel
function emitStartShare(payload: { accessToken: string; shareRequestId?: string }) {
  const handlers = mocks.channelHandlers[START_SHARE] || [];
  return Promise.all(handlers.map((h) => h(payload)));
}

async function loadPreset() {
  // Reset module registry so each test gets a fresh shareInFlight state
  vi.resetModules();
  const mod = await import('./preset');
  // Trigger serverChannel registration
  const serverChannel = (mod.default as any).experimental_serverChannel;
  if (serverChannel) {
    await serverChannel(mocks.channel, {
      configFile: undefined,
      presets: { apply: vi.fn(async () => ({})) },
    });
  }
  return mod;
}

beforeEach(() => {
  // Clear handlers between tests
  Object.keys(mocks.channelHandlers).forEach((k) => {
    delete mocks.channelHandlers[k];
  });
  mocks.shareProgressState.value = undefined;
  vi.clearAllMocks();
});

describe('preset START_SHARE handler', () => {
  it('single-flight: second START_SHARE while first is in-flight is ignored', async () => {
    await loadPreset();

    let resolveShare!: (v: any) => void;
    mocks.shareMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveShare = resolve;
      })
    );

    // Emit two START_SHARE events without awaiting
    emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });
    emitStartShare({ accessToken: 'token', shareRequestId: 'req-2' });

    resolveShare({ shareUrl: 'https://share.example.com/1' });

    // Give promises time to flush
    await new Promise((r) => setTimeout(r, 0));

    expect(mocks.shareMock).toHaveBeenCalledOnce();
  });

  it('echoes shareRequestId on SHARE_PROGRESS emits', async () => {
    await loadPreset();

    mocks.shareMock.mockImplementationOnce(
      async ({ onUrl, onProgress }: { onUrl: (u: string) => void; onProgress: (c: number, t: number) => void }) => {
        onUrl('https://share.example.com/sb');
        onProgress(50, 100);
        return { shareUrl: 'https://share.example.com/sb' };
      }
    );

    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-xyz' });

    // Check that all progress state values carry the shareRequestId
    // The final value is 'complete'
    expect(mocks.shareProgressState.value).toMatchObject({
      status: 'complete',
      shareRequestId: 'req-xyz',
    });
  });

  it('onProgress with total=0 emits progress=0 (no NaN)', async () => {
    await loadPreset();

    let capturedProgress: number | undefined;

    mocks.shareMock.mockImplementationOnce(
      async ({ onProgress }: { onProgress: (c: number, t: number) => void }) => {
        onProgress(0, 0);
        capturedProgress = mocks.shareProgressState.value?.progress;
        return { shareUrl: 'https://share.example.com/sb' };
      }
    );

    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });

    expect(capturedProgress).toBe(0);
    expect(Number.isNaN(capturedProgress)).toBe(false);
  });

  it('onError sets status=error and subsequent share() resolution does NOT overwrite to complete', async () => {
    await loadPreset();

    mocks.shareMock.mockImplementationOnce(
      async ({ onError }: { onError: (e: Error) => void }) => {
        onError(new Error('upload failed'));
        return { shareUrl: 'https://share.example.com/sb' };
      }
    );

    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });

    expect(mocks.shareProgressState.value).toMatchObject({
      status: 'error',
      error: 'upload failed',
    });
  });
});
