import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCESS_TOKEN_KEY } from '../env';
import { __testUtils, setAuthenticatedSession } from './graphQLClient';
import type { AuthStorage } from './requestAccessToken';

const createAuth = (overrides: Partial<AuthStorage> = {}): AuthStorage => ({
  version: 2,
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  sessionId: 'session-id-1',
  ...overrides,
});

const ensureLocalStorage = () => {
  if (globalThis.localStorage) {
    return;
  }
  let store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    } satisfies Storage,
  });
};

describe('graphQLClient refresh auth', () => {
  beforeEach(() => {
    ensureLocalStorage();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('updates access and refresh tokens after successful refresh', async () => {
    setAuthenticatedSession(createAuth());
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'access-token-2',
          refresh_token: 'refresh-token-2',
        }),
        { status: 200 }
      )
    );

    await __testUtils.refreshCurrentSession();

    expect(__testUtils.getCurrentAuth()).toMatchObject({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
      sessionId: 'session-id-1',
    });

    expect(JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY) || '{}')).toMatchObject({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
      sessionId: 'session-id-1',
    });
  });

  it('notifies token subscribers when refresh updates token', async () => {
    setAuthenticatedSession(createAuth());
    const subscriber = vi.fn();
    const unsubscribe = __testUtils.subscribeToTokenUpdates(subscriber);
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'access-token-2',
          refresh_token: 'refresh-token-2',
        }),
        { status: 200 }
      )
    );

    await __testUtils.refreshCurrentSession();
    unsubscribe();

    expect(subscriber).toHaveBeenLastCalledWith('access-token-2');
  });

  it('clears auth state and rejects when refresh fails with terminal error', async () => {
    setAuthenticatedSession(createAuth());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(__testUtils.refreshCurrentSession()).rejects.toThrow('Token refresh failed (401)');

    expect(__testUtils.getCurrentAuth()).toBeNull();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('does not retry terminal OAuth refresh errors', async () => {
    setAuthenticatedSession(createAuth());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 'invalid_grant',
        }),
        { status: 200 }
      )
    );

    await expect(__testUtils.refreshCurrentSession()).rejects.toThrow('invalid_grant');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('reuses the previous refresh token when refresh response omits rotation', async () => {
    setAuthenticatedSession(createAuth());
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'access-token-2',
        }),
        { status: 200 }
      )
    );

    await __testUtils.refreshCurrentSession();

    expect(__testUtils.getCurrentAuth()).toMatchObject({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-1',
    });
  });

  it('does not restore auth after logout while refresh is in flight', async () => {
    setAuthenticatedSession(createAuth());
    let resolveRefresh!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        })
    );

    const refreshPromise = __testUtils.refreshCurrentSession();
    __testUtils.clearCurrentAuth();
    resolveRefresh(
      new Response(
        JSON.stringify({
          access_token: 'access-token-2',
          refresh_token: 'refresh-token-2',
        }),
        { status: 200 }
      )
    );

    await refreshPromise;

    expect(__testUtils.getCurrentAuth()).toBeNull();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });
});
