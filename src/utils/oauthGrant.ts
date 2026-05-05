import { fetchAccessToken, type TokenExchangeParameters } from './requestAccessToken';
import type { DialogHandler } from './useChromaticDialog';

type DialogPayload = Parameters<DialogHandler>[0];

export type GrantOutcome =
  | { kind: 'login' }
  | { kind: 'denied' }
  | { kind: 'error'; message: string }
  | { kind: 'ignore' }
  | { kind: 'code'; code: string };

export const exchangeOAuthCode = async (
  params: Pick<
    TokenExchangeParameters,
    'clientId' | 'codeVerifier' | 'redirectUri' | 'tokenEndpoint'
  >,
  code: string
): Promise<string> => {
  const token = await fetchAccessToken({ ...params, code });
  if (!token) throw new Error('Failed to fetch an access token');
  return token;
};

export const parseGrantPayload = (event: DialogPayload, expectedState: string): GrantOutcome => {
  if (event.message === 'login') return { kind: 'login' };
  if (event.message !== 'grant') return { kind: 'ignore' };

  if ('denied' in event) {
    if (!('state' in event) || event.state !== expectedState) return { kind: 'ignore' };
    return event.denied ? { kind: 'denied' } : { kind: 'ignore' };
  }
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
