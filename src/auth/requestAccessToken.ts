import { z } from 'zod';

import { OAUTH_CLIENT_ID } from '../constants';
import { CHROMATIC_BASE_URL } from '../env';
// @ts-expect-error File is in plain JS
import { sha256 } from '../utils/sha256';
import { SUBDOMAIN_REGEX } from './subdomain';

// Details we exchange with the Chromatic OAuth server
export type TokenExchangeParameters = {
  redirectUri: string;
  codeVerifier: string;
  state: string;
  sessionId: string;
  authorizationUrl: string;
  subdomain?: string;
};

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

// Refresh failures that mean the refresh token is unusable. The session
// must be cleared and the user must sign in again. Transient failures
// (network, 5xx, AbortError) preserve the current session for retry.
export class TerminalAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TerminalAuthError';
  }
}

const isTerminalRefreshStatus = (status: number) =>
  status === 400 || status === 401 || status === 403;

const bytes = (buf: number[]) => String.fromCharCode(...buf);

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

const encodeParams = (params: Record<string, string>) => new URLSearchParams(params).toString();

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
  // Token endpoints occasionally return non-JSON bodies (e.g. an HTML error
  // page from a 500 or a proxy). Surface a useful error in that case
  // instead of bubbling up a SyntaxError from JSON.parse.
  type ErrorBody = { error?: string; error_description?: string };
  let rawData: ErrorBody | null = null;
  try {
    rawData = (await res.json()) as ErrorBody;
  } catch {
    if (!res.ok) {
      throw new Error(`${failureMessage} (${res.status})`);
    }
    throw new Error(failureMessage);
  }
  if (rawData?.error === 'authorization_pending') {
    throw new Error(
      `You have not authorized the Visual Tests addon for Chromatic, please try again`
    );
  }
  if (!res.ok) {
    const message =
      rawData?.error_description || rawData?.error || `${failureMessage} (${res.status})`;
    throw new Error(message);
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
    const message = `Token refresh failed (${res.status})`;
    if (isTerminalRefreshStatus(res.status)) {
      throw new TerminalAuthError(message);
    }
    throw new Error(message);
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
