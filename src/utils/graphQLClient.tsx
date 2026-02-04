import { authExchange } from '@urql/exchange-auth';
import React, { useEffect } from 'react';
import { useAddonState } from 'storybook/manager-api';
import { Client, ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
import { v4 as uuid } from 'uuid';

import { ACCESS_TOKEN_KEY, ADDON_ID, CHROMATIC_API_URL } from '../constants';
import { TokenExchangeParameters } from './requestAccessToken';
import { clearSessionState, useSessionState } from './useSessionState';

let currentToken: string | null;
let currentTokenExpiration: number | null;
const persistCurrentToken = (token: string | null) => {
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

persistCurrentToken(localStorage.getItem(ACCESS_TOKEN_KEY));
interface AuthValue {
  token: string | null;
  isOpen: boolean;
  subdomain: string;
  screen: 'welcome' | 'signin' | 'subdomain' | 'verify';
  exchangeParameters: TokenExchangeParameters | null;
}

export const useAuth = () => {
  const [subdomain, setSubdomain] = useSessionState<string>('subdomain', 'www');
  const [exchangeParameters, setExchangeParameters] =
    useSessionState<TokenExchangeParameters | null>('exchangeParameters', null);

  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
  const [auth, setAuth] = useAddonState<AuthValue>(`${ADDON_ID}/auth`, {
    token: currentToken,
    isOpen: false,
    subdomain: subdomain,
    screen: 'welcome',
    exchangeParameters,
  });

  useEffect(() => {
    if (!auth.token) {
      clearSessionState('authenticationScreen', 'exchangeParameters');
    } else {
      persistCurrentToken(auth.token);
    }
  }, [auth.token]);

  useEffect(() => {
    setSubdomain(auth.subdomain);
  }, [auth.subdomain, setSubdomain]);

  useEffect(() => {
    setExchangeParameters(auth.exchangeParameters);
  }, [auth.exchangeParameters, setExchangeParameters]);

  return [auth, setAuth] as const;
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
          if (result.data?.viewer === null) persistCurrentToken(null);
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
            persistCurrentToken(null);
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
