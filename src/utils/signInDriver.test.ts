import { describe, expect, it } from 'vitest';

import { createSignInDriver, handlesOAuthRedirect, OAUTH_FLOW } from './signInDriver';

describe('signInDriver', () => {
  it('exports OAUTH_FLOW as one of the OAuthFlow literals', () => {
    expect(['authorization-code', 'device-code']).toContain(OAUTH_FLOW);
  });

  it('createSignInDriver returns a driver matching the configured flow', () => {
    expect(createSignInDriver().flow).toBe(OAUTH_FLOW);
  });

  it('handlesOAuthRedirect mirrors authorization-code selection', () => {
    expect(handlesOAuthRedirect).toBe(OAUTH_FLOW === 'authorization-code');
  });
});
