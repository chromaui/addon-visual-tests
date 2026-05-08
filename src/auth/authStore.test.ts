import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../env', () => ({ ACCESS_TOKEN_KEY: 'test-access-token' }));
vi.mock('../constants', () => ({
  ADDON_ID: 'addon-test',
  OAUTH_CLIENT_ID: 'cid',
}));

class FakeStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
const fakeWindow = {
  addEventListener: (type: string, cb: (...args: unknown[]) => void) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(cb);
  },
  removeEventListener: (type: string, cb: (...args: unknown[]) => void) => {
    listeners.get(type)?.delete(cb);
  },
  dispatchEvent: (event: Event) => {
    listeners.get(event.type)?.forEach((cb) => cb(event));
    return true;
  },
  CustomEvent: class CustomEvent<T = unknown> {
    type: string;
    detail?: T;
    constructor(type: string, init?: { detail?: T }) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
};

vi.stubGlobal('window', fakeWindow);
vi.stubGlobal('localStorage', new FakeStorage());

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));

vi.mock('./requestAccessToken', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./requestAccessToken')>();
  return { ...actual, refreshAccessToken: refreshMock };
});

const { authStore, SESSION_EXPIRED_EVENT_NAME } = await import('./authStore');
const { TerminalAuthError } = await import('./requestAccessToken');

const makeAuth = (
  overrides: Partial<{ accessToken: string; refreshToken: string; sessionId: string }> = {}
) => ({
  version: 2 as const,
  accessToken: overrides.accessToken ?? 'a1',
  refreshToken: overrides.refreshToken ?? 'r1',
  sessionId: overrides.sessionId ?? 's1',
});

beforeEach(() => {
  authStore.clear();
  refreshMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authStore.refresh', () => {
  it('updates auth on successful refresh', async () => {
    authStore.setAuth(makeAuth());
    refreshMock.mockResolvedValueOnce(makeAuth({ accessToken: 'a2', refreshToken: 'r2' }));

    await authStore.refresh();

    expect(authStore.getToken()).toBe('a2');
    expect(authStore.getAuth()?.refreshToken).toBe('r2');
  });

  it('clears session and notifies on TerminalAuthError', async () => {
    authStore.setAuth(makeAuth());
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);
    refreshMock.mockRejectedValueOnce(new TerminalAuthError('Token refresh failed (401)'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(authStore.refresh()).rejects.toThrow('Token refresh failed (401)');

    expect(authStore.getToken()).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
    warn.mockRestore();
    window.removeEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);
  });

  it('preserves session on transient (network/5xx) error', async () => {
    authStore.setAuth(makeAuth());
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);
    refreshMock.mockRejectedValueOnce(new Error('Token refresh failed (503)'));

    await expect(authStore.refresh()).rejects.toThrow('Token refresh failed (503)');

    expect(authStore.getToken()).toBe('a1');
    expect(onExpired).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);
  });

  it('preserves session on AbortError', async () => {
    authStore.setAuth(makeAuth());
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    refreshMock.mockRejectedValueOnce(abortError);

    await expect(authStore.refresh()).rejects.toThrow('aborted');

    expect(authStore.getToken()).toBe('a1');
  });

  it('does not clear a newer session when a stale refresh fails terminally', async () => {
    authStore.setAuth(makeAuth());
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);

    let rejectStale!: (e: Error) => void;
    refreshMock.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectStale = reject;
      })
    );

    const inflight = authStore.refresh();

    // User logs in with a different session before the stale refresh resolves.
    authStore.setAuth(makeAuth({ accessToken: 'new', refreshToken: 'r-new', sessionId: 's-new' }));

    rejectStale(new TerminalAuthError('Token refresh failed (401)'));

    await expect(inflight).rejects.toThrow();
    expect(authStore.getToken()).toBe('new');
    expect(onExpired).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT_NAME, onExpired);
  });

  it('no-ops when refresh is called with no auth', async () => {
    await authStore.refresh();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(authStore.getToken()).toBeNull();
  });
});
