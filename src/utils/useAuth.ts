import { useEffect } from 'react';
import { useAddonState } from 'storybook/manager-api';

import { ADDON_ID } from '../constants';
import { getCurrentToken, persistCurrentToken } from './graphQLClient';
import { TokenExchangeParameters } from './requestAccessToken';
import { clearSessionState, useSessionState } from './useSessionState';

export interface AuthValue {
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
    token: getCurrentToken(),
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
