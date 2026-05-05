import { createAuthCodeDriver } from './authCodeDriver';
import { createDeviceCodeDriver } from './deviceCodeDriver';

export type OAuthFlow = 'authorization-code' | 'device-code';

// Single switch for the OAuth flow used across the addon. The explicit
// OAuthFlow annotation widens the literal type so both branches in
// createSignInDriver remain reachable to type-checkers and bundlers.
export const OAUTH_FLOW: OAuthFlow = 'device-code';

// True when the configured flow round-trips through this window (the addon
// page is opened as the OAuth redirect target). Lets manager.tsx decide
// whether to install the redirect handler without instantiating a driver.
export const handlesOAuthRedirect: boolean = OAUTH_FLOW === 'authorization-code';

export type SignInAffordance = { userCode: string; verificationUrl: string };

export type DriverSnapshot =
  | { flow: 'authorization-code'; params: import('./requestAccessToken').TokenExchangeParameters }
  | {
      flow: 'device-code';
      deviceCode: string;
      verifier: string;
      expires: number;
      interval: number;
      userCode: string;
      verificationUrl: string;
      tokenEndpoint: string;
    };

export type DriverAction =
  | { type: 'VERIFICATION_STARTED'; userCode: string; verificationUrl: string }
  | { type: 'VERIFICATION_FAILED'; reason: 'cancelled' | 'expired' | 'unknown' };

export type StartOpts = {
  subdomain?: string;
  dispatch?: (action: DriverAction) => void;
  onSnapshot?: (snapshot: DriverSnapshot) => void;
};

export type StartResult = {
  affordance?: SignInAffordance;
  token: Promise<string>;
};

export interface SignInDriver {
  flow: OAuthFlow;
  start(opts: StartOpts): Promise<StartResult>;
  resume?(snapshot: DriverSnapshot, opts: StartOpts): Promise<StartResult>;
  cancel(): void;
}

export const createSignInDriver = (): SignInDriver =>
  OAUTH_FLOW === 'device-code' ? createDeviceCodeDriver() : createAuthCodeDriver();
