import { OAUTH_CLIENT_ID } from '../constants';
import { CHROMATIC_BASE_URL } from '../env';
// @ts-expect-error File is in plain JS
import { sha256 } from './sha256';

// Details we exchange with the Chromatic OAuth server
export type TokenExchangeParameters = {
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  state: string;
  authorizationUrl: string;
};

const bytes = (buf: number[]) =>
  new Uint8Array(buf).reduce((acc, val) => acc + String.fromCharCode(val), '');

const base64 = (val: string | number[]) => window.btoa(Array.isArray(val) ? bytes(val) : val);

const base64URLEncode = (val: string | number[]) =>
  base64(val).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const hexStringToBytes = (str: string) =>
  Array.from(str.match(/.{1,2}/g) ?? [], (byte) => parseInt(byte, 16));

const randomBase64Url = (byteLength: number) => {
  const randomValues = new Uint8Array(byteLength);
  window.crypto.getRandomValues(randomValues);
  return base64URLEncode(Array.from(randomValues));
};

const encodeParams = (params: Record<string, string | number | boolean>) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

const authorizationPending = ({ error }: { error: string }) => error === 'authorization_pending';

const resolveChromaticHost = (subdomain?: string) => {
  if (!subdomain) {
    return CHROMATIC_BASE_URL;
  }
  const base = new URL(CHROMATIC_BASE_URL);
  if (base.hostname === 'www.chromatic.com') {
    base.hostname = `${subdomain}.chromatic.com`;
  }
  return base.origin;
};

export const initiateSignin = async (subdomain?: string): Promise<TokenExchangeParameters> => {
  const state = randomBase64Url(32);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = base64URLEncode(hexStringToBytes(sha256(codeVerifier)));
  const chromaticBaseUrl = resolveChromaticHost(subdomain);
  const redirectUri = window.location.origin;
  const authorizationUrl = `${chromaticBaseUrl}/authorize?${encodeParams({
    client_id: OAUTH_CLIENT_ID,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    state,
    scope: 'user:read account:read project:read build:read build:write build:create',
  })}`;

  return {
    clientId: OAUTH_CLIENT_ID,
    redirectUri,
    codeVerifier,
    state,
    authorizationUrl,
  };
};

export const fetchAccessToken = async ({
  clientId,
  codeVerifier,
  redirectUri,
  code,
}: Pick<TokenExchangeParameters, 'clientId' | 'codeVerifier' | 'redirectUri'> & {
  code: string;
}) => {
  try {
    const res = await fetch(`${CHROMATIC_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: encodeParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await res.json();
    if (authorizationPending(data)) {
      throw new Error(
        `You have not authorized the Visual Tests addon for Chromatic, please try again`
      );
    } else if (data.access_token) {
      return data.access_token as string;
    }

    const message = data?.error_description || data?.error || `Token exchange failed`;
    throw new Error(message);
  } catch (err: unknown) {
    console.warn(err);
    throw err;
  }
};
