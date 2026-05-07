import { z } from 'zod';

import { OAUTH_CLIENT_ID } from '../constants';
import { CHROMATIC_BASE_URL } from '../env';
// @ts-expect-error File is in plain JS
import { sha256 } from './sha256';

// Details we exchange with the Chromatic OAuth server
export type TokenExchangeParameters = {
  redirectUri: string;
  codeVerifier: string;
  state: string;
  sessionId: string;
  authorizationUrl: string;
  subdomain?: string;
};

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{0,62}$/;

export const AuthSessionSchema = z.object({
  version: z.literal(2),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  subdomain: z.string().regex(SUBDOMAIN_REGEX).optional(),
  sessionId: z.string().min(1),
});
export type AuthSession = z.infer<typeof AuthSessionSchema>;

const TokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

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

const resolveChromaticHost = (subdomain?: string) => {
  if (!subdomain) {
    return CHROMATIC_BASE_URL;
  }
  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    throw new Error('Invalid Chromatic subdomain');
  }
  const base = new URL(CHROMATIC_BASE_URL);
  if (base.hostname.startsWith('www.')) {
    base.hostname = `${subdomain}.${base.hostname.slice(4)}`;
  }
  return base.origin;
};

export const resolveTokenEndpoint = (subdomain?: string) =>
  `${resolveChromaticHost(subdomain)}/token`;

export const initiateSignin = async (subdomain?: string): Promise<TokenExchangeParameters> => {
  const state = randomBase64Url(32);
  const codeVerifier = randomBase64Url(64);
  const sessionId = window.crypto.randomUUID();
  const codeChallenge = base64URLEncode(hexStringToBytes(sha256(codeVerifier)));
  const chromaticBaseUrl = resolveChromaticHost(subdomain);
  const redirectUri = window.location.href.split(/[?#]/)[0];
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
    redirectUri,
    codeVerifier,
    state,
    sessionId,
    authorizationUrl,
    subdomain,
  };
};

const decodeTokenResponse = async (
  res: Response,
  failureMessage: string
): Promise<TokenResponse> => {
  const rawData = await res.json();
  if (rawData?.error === 'authorization_pending') {
    throw new Error(
      `You have not authorized the Visual Tests addon for Chromatic, please try again`
    );
  }
  const parsed = TokenResponseSchema.safeParse(rawData);
  if (parsed.success) {
    return parsed.data;
  }
  const message = rawData?.error_description || rawData?.error || failureMessage;
  throw new Error(message);
};

export const fetchAccessToken = async ({
  codeVerifier,
  redirectUri,
  sessionId,
  subdomain,
  code,
}: Pick<TokenExchangeParameters, 'codeVerifier' | 'redirectUri' | 'sessionId' | 'subdomain'> & {
  code: string;
}): Promise<AuthSession> => {
  const res = await fetch(resolveTokenEndpoint(subdomain), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Chromatic-Session-ID': sessionId,
    },
    body: encodeParams({
      client_id: OAUTH_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  const data = await decodeTokenResponse(res, 'Token exchange failed');
  if (!data.refresh_token) {
    throw new Error('Token exchange failed: missing refresh token');
  }
  return {
    version: 2,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    sessionId,
    ...(subdomain ? { subdomain } : {}),
  };
};

export const refreshAccessToken = async ({
  subdomain,
  refreshToken,
  sessionId,
  signal,
}: {
  subdomain?: string;
  refreshToken: string;
  sessionId: string;
  signal: AbortSignal;
}): Promise<AuthSession> => {
  const res = await fetch(resolveTokenEndpoint(subdomain), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Chromatic-Session-ID': sessionId,
    },
    body: encodeParams({
      client_id: OAUTH_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status})`);
  }

  const data = await decodeTokenResponse(res, 'Token refresh failed');
  return {
    version: 2,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    sessionId,
    ...(subdomain ? { subdomain } : {}),
  };
};
