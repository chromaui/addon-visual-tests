import {
  type AuthStorage,
  fetchAccessToken,
  type TokenExchangeParameters,
} from './requestAccessToken';
import type { DialogHandler } from './useChromaticDialog';

type DialogPayload = Parameters<DialogHandler>[0];

export type GrantOutcome =
  | { kind: 'login' }
  | { kind: 'error'; message: string }
  | { kind: 'ignore' }
  | { kind: 'code'; code: string };

export const exchangeOAuthCode = (
  params: Pick<
    TokenExchangeParameters,
    'clientId' | 'codeVerifier' | 'redirectUri' | 'tokenEndpoint' | 'sessionId' | 'subdomain'
  >,
  code: string
): Promise<AuthStorage> => fetchAccessToken({ ...params, code });

export const parseGrantPayload = (event: DialogPayload, expectedState: string): GrantOutcome => {
  if (event.message === 'login') return { kind: 'login' };
  if (event.message !== 'grant') return { kind: 'ignore' };

  if ('error' in event) {
    if (!('state' in event) || event.state !== expectedState) return { kind: 'ignore' };
    return { kind: 'error', message: event.error_description || event.error };
  }
  if (!('code' in event) || !('state' in event)) {
    return { kind: 'error', message: 'Unexpected OAuth callback payload' };
  }
  if (event.state !== expectedState) {
    return { kind: 'error', message: 'Invalid OAuth state' };
  }
  return { kind: 'code', code: event.code };
};
