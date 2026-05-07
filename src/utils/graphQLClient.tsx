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

let currentAuth: AuthStorage | null = null;
let currentToken: string | null = null;
let refreshPromise: Promise<void> | null = null;
let refreshAbortController: AbortController | null = null;
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
  try {
    currentAuth = auth;
    currentToken = auth?.accessToken ?? null;
  } catch (_) {
    currentAuth = null;
    currentToken = null;
  }
  persistCurrentAuth();
  notifyTokenSubscribers();
};

const clearCurrentAuth = () => {
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
  } else {
    // Keep runtime behavior sane if we ever receive a token before full auth state is initialized.
    currentToken = token;
    notifyTokenSubscribers();
  }
};

const initializeCurrentAuthFromStorage = () => {
  const storage = getStorage();
  const storedAuth = storage?.getItem(ACCESS_TOKEN_KEY);
  if (!storedAuth) {
    setCurrentAuth(null);
    return;
  }
  try {
    const parsed = AuthStorageSchema.safeParse(JSON.parse(storedAuth));
    if (!parsed.success) {
      clearCurrentAuth();
      return;
    }
    setCurrentAuth(parsed.data);
  } catch {
    clearCurrentAuth();
  }
};

initializeCurrentAuthFromStorage();

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

export const getFetchOptions = (token?: string) => ({
  headers: {
    Accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
    'X-Chromatic-Session-ID': currentAuth?.sessionId || fallbackSessionId,
  },
});

const isRetryableRefreshError = (error: unknown) => {
  if (error instanceof Error) {
    const statusMatch = error.message.match(/\((\d{3})\)/);
    if (statusMatch) {
      const statusCode = Number(statusMatch[1]);
      return statusCode >= 500;
    }
    if (error.name === 'AbortError') {
      return true;
    }
    return false;
  }
  return false;
};

const attemptTokenRefresh = async () => {
  if (!currentAuth) {
    throw new Error('Token refresh failed (401)');
  }
  const abortController = new AbortController();
  refreshAbortController = abortController;
  const timeoutId = globalThis.setTimeout(() => abortController.abort(), REFRESH_TIMEOUT_MS);
  try {
    const nextAuth = await refreshAccessToken({
      clientId: OAUTH_CLIENT_ID,
      tokenEndpoint: currentAuth.tokenEndpoint,
      refreshToken: currentAuth.refreshToken,
      sessionId: currentAuth.sessionId,
      signal: abortController.signal,
    });
    setCurrentAuth(nextAuth);
  } finally {
    globalThis.clearTimeout(timeoutId);
    refreshAbortController = null;
  }
};

const refreshCurrentSession = async () => {
  if (!currentAuth) {
    clearCurrentAuth();
    return;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await attemptTokenRefresh();
      } catch (error) {
        if (isRetryableRefreshError(error)) {
          await attemptTokenRefresh();
          return;
        }
        throw error;
      }
    })()
      .catch(() => {
        console.warn('Session expired. Please sign in again.');
        clearCurrentAuth();
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
  subscribeToTokenUpdates,
  refreshCurrentSession,
};

export const GraphQLClientProvider = ({
  children,
  value = createClient(),
}: {
  children: React.ReactNode;
  value?: Client;
}) => <Provider value={value}>{children}</Provider>;
