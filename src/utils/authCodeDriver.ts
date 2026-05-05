import type { GrantOutcome } from './oauthGrant';
import { exchangeOAuthCode, parseGrantPayload } from './oauthGrant';
import { initiateSignin, type TokenExchangeParameters } from './requestAccessToken';
import type { DriverAction, SignInDriver, StartOpts, StartResult } from './signInDriver';

// The auth-code driver delegates popup management to the existing
// `useChromaticDialog` hook (React-tied). The driver maintains an internal
// deferred token promise and exposes `handleDialogEvent`, which consumers
// call from the dialog's `handler` callback. This keeps the popup hook
// reusable while letting the driver own the OAuth state machine.
export type AuthCodeDriver = SignInDriver & {
  flow: 'authorization-code';
  handleDialogEvent: (event: Parameters<typeof parseGrantPayload>[0]) => Promise<GrantOutcome>;
};

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const createAuthCodeDriver = (): AuthCodeDriver => {
  let params: TokenExchangeParameters | null = null;
  let deferred: ReturnType<typeof createDeferred<string>> | null = null;
  let abortController: AbortController | null = null;
  let dispatch: ((action: DriverAction) => void) | undefined;
  let settled = false;

  const finish = (action: () => void) => {
    if (settled) return;
    settled = true;
    action();
  };

  return {
    flow: 'authorization-code',

    async start(opts: StartOpts): Promise<StartResult> {
      params = await initiateSignin(opts.subdomain);
      deferred = createDeferred<string>();
      abortController = new AbortController();
      dispatch = opts.dispatch;
      settled = false;

      // Attach a noop catch so rejection (cancel/error) doesn't surface as
      // an unhandled rejection when the caller hasn't yet awaited the token.
      deferred.promise.catch(() => {});

      opts.onSnapshot?.({ flow: 'authorization-code', params });

      return { token: deferred.promise };
    },

    cancel() {
      abortController?.abort();
      finish(() => {
        dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'cancelled' });
        deferred?.reject(new Error('Sign-in cancelled'));
      });
    },

    async handleDialogEvent(event) {
      if (!params || !deferred) return { kind: 'ignore' };
      const outcome = parseGrantPayload(event, params.state);

      if (outcome.kind === 'login' || outcome.kind === 'ignore') return outcome;

      if (outcome.kind === 'error') {
        finish(() => {
          dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
          deferred!.reject(new Error(outcome.message));
        });
        return outcome;
      }

      // outcome.kind === 'code' — exchange and resolve.
      const exchangeParams = params;
      params = null; // prevent duplicate exchange on repeat events
      try {
        const token = await exchangeOAuthCode(exchangeParams, outcome.code);
        finish(() => {
          deferred!.resolve(token);
        });
      } catch (err) {
        finish(() => {
          dispatch?.({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
          deferred!.reject(err);
        });
      }
      return outcome;
    },
  };
};
