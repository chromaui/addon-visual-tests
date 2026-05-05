import { afterEach, describe, expect, it, vi } from 'vitest';

const initiateSignin = vi.fn();
const exchangeOAuthCode = vi.fn();

vi.mock('./requestAccessToken', () => ({
  initiateSignin: (...args: unknown[]) => initiateSignin(...args),
}));

vi.mock('./oauthGrant', async () => {
  const actual = await vi.importActual<typeof import('./oauthGrant')>('./oauthGrant');
  return {
    ...actual,
    exchangeOAuthCode: (...args: unknown[]) => exchangeOAuthCode(...args),
  };
});

const { createAuthCodeDriver } = await import('./authCodeDriver');

const defaultParams = {
  clientId: 'chromaui:addon-visual-tests',
  redirectUri: 'https://storybook.example.com/iframe.html',
  codeVerifier: 'verifier',
  state: 'state-abc',
  authorizationUrl: 'https://www.chromatic.com/authorize?...',
  tokenEndpoint: 'https://www.chromatic.com/token',
};

afterEach(() => {
  initiateSignin.mockReset();
  exchangeOAuthCode.mockReset();
});

describe('authCodeDriver', () => {
  it('reports flow=authorization-code', () => {
    const driver = createAuthCodeDriver();
    expect(driver.flow).toBe('authorization-code');
  });

  it('start() emits an authorization-code snapshot with TokenExchangeParameters', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    const onSnapshot = vi.fn();
    const driver = createAuthCodeDriver();
    await driver.start({ subdomain: 'acme', onSnapshot });
    expect(initiateSignin).toHaveBeenCalledWith('acme');
    expect(onSnapshot).toHaveBeenCalledWith({
      flow: 'authorization-code',
      params: defaultParams,
    });
  });

  it('handleDialogEvent({code,state}) exchanges and resolves the token promise', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    exchangeOAuthCode.mockResolvedValueOnce('tok-from-grant');
    const driver = createAuthCodeDriver();
    const { token } = await driver.start({});
    const outcome = await driver.handleDialogEvent({
      message: 'grant',
      code: 'auth-code-1',
      state: 'state-abc',
    });
    expect(outcome).toEqual({ kind: 'code', code: 'auth-code-1' });
    expect(exchangeOAuthCode).toHaveBeenCalledOnce();
    await expect(token).resolves.toBe('tok-from-grant');
  });

  it('handleDialogEvent ignores duplicate grant events (params cleared on first call)', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    exchangeOAuthCode.mockResolvedValueOnce('tok');
    const driver = createAuthCodeDriver();
    await driver.start({});

    await driver.handleDialogEvent({
      message: 'grant',
      code: 'auth-code-1',
      state: 'state-abc',
    });
    const second = await driver.handleDialogEvent({
      message: 'grant',
      code: 'auth-code-1',
      state: 'state-abc',
    });
    expect(second).toEqual({ kind: 'ignore' });
    expect(exchangeOAuthCode).toHaveBeenCalledOnce();
  });

  it('rejects token promise when grant payload carries an error', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    const dispatch = vi.fn();
    const driver = createAuthCodeDriver();
    const { token } = await driver.start({ dispatch });
    await driver.handleDialogEvent({
      message: 'grant',
      error: 'access_denied',
      error_description: 'User denied',
      state: 'state-abc',
    });
    await expect(token).rejects.toThrow('User denied');
    expect(dispatch).toHaveBeenCalledWith({ type: 'VERIFICATION_FAILED', reason: 'unknown' });
  });

  it('cancel() rejects the token promise and dispatches cancelled', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    const dispatch = vi.fn();
    const driver = createAuthCodeDriver();
    const { token } = await driver.start({ dispatch });
    driver.cancel();
    await expect(token).rejects.toThrow(/cancelled/i);
    expect(dispatch).toHaveBeenCalledWith({ type: 'VERIFICATION_FAILED', reason: 'cancelled' });
  });

  it('handleDialogEvent passes through login outcomes', async () => {
    initiateSignin.mockResolvedValueOnce(defaultParams);
    const driver = createAuthCodeDriver();
    await driver.start({});
    const outcome = await driver.handleDialogEvent({ message: 'login' });
    expect(outcome).toEqual({ kind: 'login' });
  });
});
