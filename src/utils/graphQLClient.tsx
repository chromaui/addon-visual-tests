import { authExchange } from '@urql/exchange-auth';
import React from 'react';
import { useAddonState } from 'storybook/manager-api';
import { Client, type ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
import { v4 as uuid } from 'uuid';

import { ADDON_ID, OAUTH_CLIENT_ID } from '../constants';
import { ACCESS_TOKEN_KEY, CHROMATIC_API_URL } from '../env';
import { type AuthStorage, AuthStorageSchema, refreshAccessToken } from './requestAccessToken';

const REFRESH_TIMEOUT_MS = 10_000;
const getStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);
const SESSION_EXPIRED_EVENT = `${ADDON_ID}/session-expired`;
const setBrowserTimeout = (...args: Parameters<typeof globalThis.setTimeout>) =>
  (typeof window !== 'undefined' ? window : globalThis).setTimeout(...args);
const clearBrowserTimeout = (...args: Parameters<typeof globalThis.clearTimeout>) =>
  (typeof window !== 'undefined' ? window : globalThis).clearTimeout(...args);

let currentAuth: AuthStorage | null = null;
let currentToken: string | null = null;
let refreshPromise: Promise<void> | null = null;
let refreshAbortController: AbortController | null = null;
let authGeneration = 0;
const tokenSubscribers = new Set<(token: string | null) => void>();
const fallbackSessionId = uuid();

const notifyTokenSubscribers = () => {
  tokenSubscribers.forEach((subscriber) => {
    subscriber(currentToken);
  });
};

const subscribeToTokenUpdates = (subscriber: (token: string | null) => void) => {
  tokenSubscribers.add(subscriber);
  return () => {
    tokenSubscribers.delete(subscriber);
  };
};

const notifySessionExpired = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new window.CustomEvent(SESSION_EXPIRED_EVENT));
};

const persistCurrentAuth = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  if (currentAuth) {
    storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(currentAuth));
  } else {
    storage.removeItem(ACCESS_TOKEN_KEY);
  }
};

const setCurrentAuth = (auth: AuthStorage | null) => {
  currentAuth = auth;
  currentToken = auth?.accessToken ?? null;

  persistCurrentAuth();
  notifyTokenSubscribers();
};

const clearCurrentAuth = () => {
  authGeneration += 1;
  refreshAbortController?.abort();
  refreshAbortController = null;
  refreshPromise = null;
  setCurrentAuth(null);
};

const setCurrentToken = (token: string | null) => {
  if (!token) {
    clearCurrentAuth();
    return;
  }
  if (currentAuth) {
    setCurrentAuth({ ...currentAuth, accessToken: token });
  }
};

const parseStoredAuth = (rawAuth: string): AuthStorage | null => {
  // Legacy format used to persist only a raw JWT string.
  if (!rawAuth.trim().startsWith('{')) {
    return null;
  }
  const parsed = AuthStorageSchema.safeParse(JSON.parse(rawAuth));
  return parsed.success ? parsed.data : null;
};

const initializeCurrentAuthFromStorage = () => {
  const storage = getStorage();
  const storedAuth = storage?.getItem(ACCESS_TOKEN_KEY);
  if (!storedAuth) {
    setCurrentAuth(null);
    return;
  }
  try {
    const parsed = parseStoredAuth(storedAuth);
    if (!parsed) {
      storage?.removeItem(ACCESS_TOKEN_KEY);
      setCurrentAuth(null);
      return;
    }
    setCurrentAuth(parsed);
  } catch {
    storage?.removeItem(ACCESS_TOKEN_KEY);
    setCurrentAuth(null);
  }
};

initializeCurrentAuthFromStorage();
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== ACCESS_TOKEN_KEY) {
      return;
    }
    if (!event.newValue) {
      setCurrentAuth(null);
      return;
    }
    try {
      const parsed = parseStoredAuth(event.newValue);
      if (!parsed) {
        getStorage()?.removeItem(ACCESS_TOKEN_KEY);
        setCurrentAuth(null);
        return;
      }
      setCurrentAuth(parsed);
    } catch {
      getStorage()?.removeItem(ACCESS_TOKEN_KEY);
      setCurrentAuth(null);
    }
  });
}

export const setAuthenticatedSession = (auth: AuthStorage) => setCurrentAuth(auth);

export const useAccessToken = () => {
  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
  const [{ token }, setTokenState] = useAddonState<{ token: string | null }>(
    `${ADDON_ID}/accessToken`,
    { token: currentToken }
  );

  const updateToken = React.useCallback((newToken: string | null) => {
    setCurrentToken(newToken);
  }, []);

  React.useEffect(
    () => subscribeToTokenUpdates((nextToken) => setTokenState({ token: nextToken })),
    [setTokenState]
  );

  return [token, updateToken] as const;
};

export const getFetchOptions = (token?: string, sessionId?: string) => ({
  headers: {
    Accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
    'X-Chromatic-Session-ID': sessionId || currentAuth?.sessionId || fallbackSessionId,
  },
});

const attemptTokenRefresh = async () => {
  const auth = currentAuth;
  if (!auth) {
    throw new Error('Token refresh failed (401)');
  }

  const generation = authGeneration;
  const abortController = new AbortController();
  refreshAbortController = abortController;
  const timeoutId = setBrowserTimeout(() => abortController.abort(), REFRESH_TIMEOUT_MS);
  try {
    const nextAuth = await refreshAccessToken({
      clientId: OAUTH_CLIENT_ID,
      subdomain: auth.subdomain,
      refreshToken: auth.refreshToken,
      sessionId: auth.sessionId,
      signal: abortController.signal,
    });
    if (generation !== authGeneration) {
      return;
    }
    setCurrentAuth(nextAuth);
  } finally {
    clearBrowserTimeout(timeoutId);
    refreshAbortController = null;
  }
};

const refreshCurrentSession = async () => {
  if (!currentAuth) {
    clearCurrentAuth();
    return;
  }

  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh()
      .catch((error) => {
        console.warn('Session expired. Please sign in again.');
        clearCurrentAuth();
        notifySessionExpired();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  await refreshPromise;
};

export const createClient = (options?: Partial<ClientOptions>) =>
  new Client({
    url: CHROMATIC_API_URL,
    exchanges: [
      // We don't use cacheExchange, because it would inadvertently share data between stories.
      mapExchange({
        onResult(result) {
          // Not all queries contain the `viewer` field, in which case it will be `undefined`.
          // When we do retrieve the field but the token is invalid, it will be `null`.
          if (result.data?.viewer === null) setCurrentToken(null);
        },
      }),
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            if (!currentToken) return operation;
            return utils.appendHeaders(operation, { Authorization: `Bearer ${currentToken}` });
          },

          // Determine if the current error is an authentication error.
          didAuthError: (error) =>
            error.response?.status === 401 ||
            error.graphQLErrors.some((e) => e.message.includes('Must login')),

          // Refresh access token on demand after auth failures.
          async refreshAuth() {
            await refreshCurrentSession();
          },

          // Reactive auth: only refresh after auth failures, not pre-emptively by token expiry.
          willAuthError() {
            return !currentToken;
          },
        };
      }),
      fetchExchange,
    ],
    fetchOptions: getFetchOptions(), // Auth header (token) is handled by authExchange
    ...options,
  });

export const __testUtils = {
  getCurrentAuth: () => currentAuth,
  clearCurrentAuth,
  subscribeToTokenUpdates,
  refreshCurrentSession,
};

export const sessionExpiredEventName = SESSION_EXPIRED_EVENT;

export const GraphQLClientProvider = ({
  children,
  value = createClient(),
}: {
  children: React.ReactNode;
  value?: Client;
}) => <Provider value={value}>{children}</Provider>;
