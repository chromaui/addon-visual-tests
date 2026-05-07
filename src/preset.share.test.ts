import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CANCEL_SHARE, SHARE_PROGRESS, START_SHARE } from './constants';

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

function emitCancelShare(payload: { shareRequestId?: string } = {}) {
  const handlers = mocks.channelHandlers[CANCEL_SHARE] || [];
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

    resolveShare({ shareUrl: 'https://share.example.com/1', daysToExpire: 7 });

    // Give promises time to flush
    await new Promise((r) => setTimeout(r, 0));

    expect(mocks.shareMock).toHaveBeenCalledOnce();
  });

  it('echoes shareRequestId on SHARE_PROGRESS emits', async () => {
    await loadPreset();

    mocks.shareMock.mockImplementationOnce(async ({ onUrl }: { onUrl: (u: string) => void }) => {
      onUrl('https://share.example.com/sb');
      return { shareUrl: 'https://share.example.com/sb' };
    });

    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-xyz' });

    expect(mocks.shareProgressState.value).toMatchObject({
      status: 'complete',
      shareRequestId: 'req-xyz',
    });
  });

  it('onError sets status=error and subsequent share() resolution does NOT overwrite to complete', async () => {
    await loadPreset();

    mocks.shareMock.mockImplementationOnce(async ({ onError }: { onError: (e: Error) => void }) => {
      onError(new Error('upload failed'));
      return { shareUrl: 'https://share.example.com/sb', daysToExpire: 7 };
    });

    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });

    expect(mocks.shareProgressState.value).toMatchObject({
      status: 'error',
      error: 'upload failed',
    });
  });

  it('CANCEL_SHARE aborts the in-flight signal and emits canceled', async () => {
    await loadPreset();

    let capturedSignal: AbortSignal | undefined;
    mocks.shareMock.mockImplementationOnce(({ abortSignal }: { abortSignal?: AbortSignal }) => {
      capturedSignal = abortSignal;
      return new Promise((_resolve, reject) => {
        abortSignal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });

    const shareDone = emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });
    await new Promise((r) => setTimeout(r, 0));

    await emitCancelShare({ shareRequestId: 'req-1' });
    expect(capturedSignal?.aborted).toBe(true);

    await shareDone;
    expect(mocks.shareProgressState.value).toMatchObject({
      status: 'error',
      canceled: true,
      error: 'canceled',
      shareRequestId: 'req-1',
    });

    // After abort, shareInFlight should be released — a new share with a different id must run
    mocks.shareMock.mockResolvedValueOnce({
      shareUrl: 'https://share.example.com/2',
      daysToExpire: 7,
    });
    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-2' });
    expect(mocks.shareMock).toHaveBeenCalledTimes(2);
  });

  it('post-cancel restart with a fresh id starts a new non-aborted share()', async () => {
    await loadPreset();

    const captured: AbortSignal[] = [];
    mocks.shareMock.mockImplementationOnce(({ abortSignal }: { abortSignal?: AbortSignal }) => {
      if (abortSignal) captured.push(abortSignal);
      return new Promise((_resolve, reject) => {
        abortSignal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });

    const first = emitStartShare({ accessToken: 'token', shareRequestId: 'req-1' });
    await new Promise((r) => setTimeout(r, 0));
    await emitCancelShare({ shareRequestId: 'req-1' });
    await first;

    mocks.shareMock.mockImplementationOnce(
      async ({ abortSignal }: { abortSignal?: AbortSignal }) => {
        if (abortSignal) captured.push(abortSignal);
        return { shareUrl: 'https://share.example.com/2', daysToExpire: 7 };
      }
    );
    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-2' });

    expect(captured).toHaveLength(2);
    expect(captured[0].aborted).toBe(true);
    expect(captured[1].aborted).toBe(false);
  });

  it('duplicate START_SHARE with the id of the last completed share is ignored', async () => {
    await loadPreset();

    mocks.shareMock.mockResolvedValueOnce({
      shareUrl: 'https://share.example.com/sb',
      daysToExpire: 7,
    });
    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-done' });
    expect(mocks.shareProgressState.value).toMatchObject({ status: 'complete' });
    expect(mocks.shareMock).toHaveBeenCalledTimes(1);

    // Resending the same id should be a no-op (no second share() invocation, no progress emit churn)
    const valueBeforeReplay = mocks.shareProgressState.value;
    await emitStartShare({ accessToken: 'token', shareRequestId: 'req-done' });
    expect(mocks.shareMock).toHaveBeenCalledTimes(1);
    expect(mocks.shareProgressState.value).toBe(valueBeforeReplay);
  });

  it('CANCEL_SHARE with mismatched shareRequestId does not abort the active share', async () => {
    await loadPreset();

    let capturedSignal: AbortSignal | undefined;
    mocks.shareMock.mockImplementationOnce(({ abortSignal }: { abortSignal?: AbortSignal }) => {
      capturedSignal = abortSignal;
      return new Promise((_resolve, reject) => {
        abortSignal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });

    const shareDone = emitStartShare({ accessToken: 'token', shareRequestId: 'req-active' });
    await new Promise((r) => setTimeout(r, 0));

    // Stale cancel for a different request id — must be ignored
    await emitCancelShare({ shareRequestId: 'req-stale' });
    expect(capturedSignal?.aborted).toBe(false);

    // Cancel with matching id should abort
    await emitCancelShare({ shareRequestId: 'req-active' });
    expect(capturedSignal?.aborted).toBe(true);

    await shareDone;
  });
});
