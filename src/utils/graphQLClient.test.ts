import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthSession } from '../auth/requestAccessToken';
import { ACCESS_TOKEN_KEY } from '../env';
import { __testUtils, createClient, setAuthenticatedSession } from './graphQLClient';

const createAuth = (overrides: Partial<AuthSession> = {}): AuthSession => ({
  version: 2,
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  sessionId: 'session-id-1',
  ...overrides,
});

const createJwtWithExp = (exp: number) => {
  const encodeSegment = (value: object) =>
    globalThis
      .btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  return `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment({ exp })}.signature`;
};
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

  it('does not clear auth when viewer is null without an auth error', async () => {
    setAuthenticatedSession(createAuth());
    const client = createClient();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            viewer: null,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await client.query('{ viewer { __typename } }', {}).toPromise();

    expect(result.error).toBeUndefined();
    expect(__testUtils.getCurrentAuth()).toMatchObject({
      accessToken: 'access-token-1',
      refreshToken: 'refresh-token-1',
    });
  });

  it('refreshes session before query when token is near expiry', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const soonToExpireToken = createJwtWithExp(nowSeconds + 30);
    const refreshedToken = createJwtWithExp(nowSeconds + 3600);
    setAuthenticatedSession(
      createAuth({
        accessToken: soonToExpireToken,
      })
    );

    const client = createClient();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: refreshedToken,
            refresh_token: 'refresh-token-2',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              viewer: null,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

    await client.query('{ viewer { __typename } }', {}).toPromise();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/token$/),
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(__testUtils.getCurrentAuth()).toMatchObject({
      accessToken: refreshedToken,
      refreshToken: 'refresh-token-2',
    });
  });
});
