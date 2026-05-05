import { OAUTH_CLIENT_ID } from '../constants';
import { CHROMATIC_BASE_URL } from '../env';
// @ts-expect-error File is in plain JS
import { sha256 } from './sha256';
import type {
  DriverAction,
  DriverSnapshot,
  SignInDriver,
  StartOpts,
  StartResult,
} from './signInDriver';

export class BetaUserDeniedError extends Error {
  constructor(message = 'You must be a beta user to use this addon at this time.') {
    super(message);
    this.name = 'BetaUserDeniedError';
  }
}

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
  if (!subdomain) return CHROMATIC_BASE_URL;
  const base = new URL(CHROMATIC_BASE_URL);
  if (base.hostname.startsWith('www.')) {
    base.hostname = `${subdomain}.${base.hostname.slice(4)}`;
  }
  return base.origin;
};

type DeviceCodeSession = {
  deviceCode: string;
  verifier: string;
  expires: number;
  interval: number;
  userCode: string;
  verificationUrl: string;
  tokenEndpoint: string;
};

const clampInterval = (raw: number) => {
  const ms = Number(raw);
  return Number.isFinite(ms) && ms >= 1000 ? ms : 1000;
};

export const createDeviceCodeDriver = (): SignInDriver => {
  let abortController: AbortController | null = null;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let popup: Window | null = null;
  let dispatch: ((action: DriverAction) => void) | undefined;
  let activeDeferred: { resolve: (v: string) => void; reject: (e: unknown) => void } | null = null;
  let settled = false;

  const clearTimer = () => {
    if (pollTimer !== null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  };

  const finishOnce = (action: () => void) => {
    if (settled) return;
    settled = true;
    clearTimer();
    action();
  };

  const closePopup = () => {
    try {
      popup?.close();
    } catch {
      // popup may already be closed
    }
    popup = null;
  };

  const pollOnce = async (
    session: DeviceCodeSession,
    deferred: { resolve: (v: string) => void; reject: (e: unknown) => void }
  ): Promise<void> => {
    if (settled) return;

    if (Date.now() >= session.expires) {
      finishOnce(() => {
        dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'expired' });
        deferred.reject(new Error('Token exchange expired, please restart sign in.'));
      });
      return;
    }

    try {
      const res = await fetch(session.tokenEndpoint, {
        method: 'POST',
        signal: abortController?.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: encodeParams({
          client_id: OAUTH_CLIENT_ID,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: session.deviceCode,
          code_verifier: session.verifier,
          scope: 'user:read account:read project:read project:write',
        }),
      });
      const data = await res.json();

      if (data.access_token) {
        finishOnce(() => {
          closePopup();
          deferred.resolve(data.access_token as string);
        });
        return;
      }

      if (data.error === 'authorization_pending') {
        pollTimer = setTimeout(() => pollOnce(session, deferred), session.interval);
        return;
      }

      if (data.error_description === 'Not OAuth beta user') {
        finishOnce(() => {
          dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
          deferred.reject(new BetaUserDeniedError());
        });
        return;
      }

      finishOnce(() => {
        dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
        deferred.reject(new Error(data.error_description || data.error || 'Token exchange failed'));
      });
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      finishOnce(() => {
        dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
        deferred.reject(err);
      });
    }
  };

  const beginPolling = (
    session: DeviceCodeSession,
    deferred: { resolve: (v: string) => void; reject: (e: unknown) => void }
  ) => {
    pollTimer = setTimeout(() => pollOnce(session, deferred), session.interval);
  };

  const requestDeviceCode = async (
    subdomain: string | undefined,
    signal: AbortSignal
  ): Promise<DeviceCodeSession> => {
    const verifier = randomBase64Url(64);
    const challenge = base64URLEncode(hexStringToBytes(sha256(verifier)));
    const chromaticBaseUrl = resolveChromaticHost(subdomain);

    const res = await fetch(`${chromaticBaseUrl}/authorize`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: encodeParams({
        client_id: OAUTH_CLIENT_ID,
        code_challenge: challenge,
      }),
    });

    const {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri_complete,
      expires_in,
      interval,
    } = await res.json();

    const verificationUrl = subdomain
      ? String(verification_uri_complete).replace('https://www', `https://${subdomain}`)
      : (verification_uri_complete as string);

    return {
      deviceCode,
      verifier,
      userCode,
      verificationUrl,
      expires: Date.now() + Number(expires_in) * 1000,
      interval: clampInterval(Number(interval) * 1000),
      tokenEndpoint: `${chromaticBaseUrl}/token`,
    };
  };

  const beginStart = (session: DeviceCodeSession, opts: StartOpts): StartResult => {
    dispatch = opts.dispatch;
    settled = false;

    opts.onSnapshot?.({
      flow: 'device-code',
      deviceCode: session.deviceCode,
      verifier: session.verifier,
      expires: session.expires,
      interval: session.interval,
      userCode: session.userCode,
      verificationUrl: session.verificationUrl,
      tokenEndpoint: session.tokenEndpoint,
    });

    dispatch?.({
      type: 'VERIFICATION_STARTED',
      userCode: session.userCode,
      verificationUrl: session.verificationUrl,
    });

    popup = window.open(session.verificationUrl, '_blank');

    let resolve!: (v: string) => void;
    let reject!: (e: unknown) => void;
    const tokenPromise = new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    // Attach a noop catch so a rejected token (cancel/expired/error) doesn't
    // surface as an unhandled rejection if the consumer never awaits it.
    tokenPromise.catch(() => {});
    activeDeferred = { resolve, reject };

    beginPolling(session, activeDeferred);

    return {
      affordance: {
        userCode: session.userCode,
        verificationUrl: session.verificationUrl,
      },
      token: tokenPromise,
    };
  };

  return {
    flow: 'device-code',

    async start(opts: StartOpts): Promise<StartResult> {
      abortController = new AbortController();
      const session = await requestDeviceCode(opts.subdomain, abortController.signal);
      return beginStart(session, opts);
    },

    async resume(snapshot: DriverSnapshot, opts: StartOpts): Promise<StartResult> {
      if (snapshot.flow !== 'device-code') {
        throw new Error('Cannot resume non-device-code snapshot');
      }
      abortController = new AbortController();
      const session: DeviceCodeSession = {
        deviceCode: snapshot.deviceCode,
        verifier: snapshot.verifier,
        expires: snapshot.expires,
        interval: clampInterval(snapshot.interval),
        userCode: snapshot.userCode,
        verificationUrl: snapshot.verificationUrl,
        tokenEndpoint: snapshot.tokenEndpoint,
      };
      return beginStart(session, opts);
    },

    cancel() {
      abortController?.abort();
      finishOnce(() => {
        dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'cancelled' });
        closePopup();
        activeDeferred?.reject(new Error('Sign-in cancelled'));
        activeDeferred = null;
      });
    },
  };
};
