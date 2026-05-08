import { authExchange } from '@urql/exchange-auth';
import React from 'react';
import { useAddonState } from 'storybook/manager-api';
import { Client, type ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';

import { authStore, SESSION_EXPIRED_EVENT_NAME } from '../auth/authStore';
import type { AuthSession } from '../auth/requestAccessToken';
import { ADDON_ID } from '../constants';
import { CHROMATIC_API_URL } from '../env';

export const setAuthenticatedSession = (auth: AuthSession) => authStore.setAuth(auth);

export const useAccessToken = () => {
  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
  const [{ token }, setTokenState] = useAddonState<{ token: string | null }>(
    `${ADDON_ID}/accessToken`,
    { token: authStore.getToken() }
  );

  const updateToken = React.useCallback((newToken: string | null) => {
    authStore.setToken(newToken);
  }, []);

  React.useEffect(
    () => authStore.subscribe((nextToken) => setTokenState({ token: nextToken })),
    [setTokenState]
  );

  return [token, updateToken] as const;
};

export const getFetchOptions = (token?: string, sessionId?: string) => ({
  headers: {
    Accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
    'X-Chromatic-Session-ID': sessionId || authStore.getSessionId(),
  },
});

export const createClient = (options?: Partial<ClientOptions>) =>
  new Client({
    url: CHROMATIC_API_URL,
    exchanges: [
      // We don't use cacheExchange, because it would inadvertently share data between stories.
      mapExchange({
        onResult(result) {
          // Not all queries contain the `viewer` field, in which case it will be `undefined`.
          // When we do retrieve the field but the token is invalid, it will be `null`.
          if (result.data?.viewer === null) authStore.setToken(null);
        },
      }),
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const token = authStore.getToken();
            if (!token) return operation;
            return utils.appendHeaders(operation, { Authorization: `Bearer ${token}` });
          },

          // Determine if the current error is an authentication error.
          didAuthError: (error) =>
            error.response?.status === 401 ||
            error.graphQLErrors.some((e) => e.message.includes('Must login')),

          // Refresh access token on demand after auth failures.
          async refreshAuth() {
            await authStore.refresh();
          },

          // Reactive auth: only refresh after auth failures, not pre-emptively by token expiry.
          willAuthError() {
            return !authStore.getToken();
          },
        };
      }),
      fetchExchange,
    ],
    fetchOptions: getFetchOptions(), // Auth header (token) is handled by authExchange
    ...options,
  });

export const __testUtils = {
  getCurrentAuth: () => authStore.getAuth(),
  clearCurrentAuth: () => authStore.clear(),
  subscribeToTokenUpdates: (cb: (token: string | null) => void) => authStore.subscribe(cb),
  refreshCurrentSession: () => authStore.refresh(),
};

export const sessionExpiredEventName = SESSION_EXPIRED_EVENT_NAME;

export const GraphQLClientProvider = ({
  children,
  value = createClient(),
}: {
  children: React.ReactNode;
  value?: Client;
}) => <Provider value={value}>{children}</Provider>;
