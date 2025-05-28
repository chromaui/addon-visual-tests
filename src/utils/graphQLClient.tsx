import { authExchange } from '@urql/exchange-auth';
import React from 'react';
import { useAddonState } from 'storybook/manager-api';
import { Client, ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
import { v4 as uuid } from 'uuid';

import { ACCESS_TOKEN_KEY, ADDON_ID, CHROMATIC_API_URL } from '../constants';

let currentToken: string | null;
let currentTokenExpiration: number | null;
const setCurrentToken = (token: string | null) => {
  try {
    const { exp } = token ? JSON.parse(atob(token.split('.')[1])) : { exp: null };
    currentToken = token;
    currentTokenExpiration = exp;
  } catch (_) {
    currentToken = null;
    currentTokenExpiration = null;
  }
  if (currentToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, currentToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

setCurrentToken(localStorage.getItem(ACCESS_TOKEN_KEY));

export const useAccessToken = () => {
  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
  const [{ token }, setTokenState] = useAddonState<{ token: string | null }>(
    `${ADDON_ID}/accessToken`,
    { token: currentToken }
  );

  const updateToken = React.useCallback(
    (newToken: string | null) => {
      setCurrentToken(newToken);
      setTokenState({ token: currentToken });
    },
    [setTokenState]
  );

  return [token, updateToken] as const;
};

const sessionId = uuid();

export const getFetchOptions = (token?: string) => ({
  headers: {
    Accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
    'X-Chromatic-Session-ID': sessionId,
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

          // If didAuthError returns true, clear the token. Ideally we should refresh the token here.
          // The operation will be retried automatically.
          async refreshAuth() {
            setCurrentToken(null);
          },

          // Prevent making a request if we know the token is missing, invalid or expired.
          // This handler is called repeatedly so we avoid parsing the token each time.
          willAuthError() {
            if (!currentToken) return true;
            try {
              if (!currentTokenExpiration) {
                const { exp } = JSON.parse(atob(currentToken.split('.')[1]));
                currentTokenExpiration = exp;
              }
              return Date.now() / 1000 > (currentTokenExpiration || 0);
            } catch (_) {
              return true;
            }
          },
        };
      }),
      fetchExchange,
    ],
    fetchOptions: getFetchOptions(), // Auth header (token) is handled by authExchange
    ...options,
  });

export const GraphQLClientProvider = ({
  children,
  value = createClient(),
}: {
  children: React.ReactNode;
  value?: Client;
}) => <Provider value={value}>{children}</Provider>;
