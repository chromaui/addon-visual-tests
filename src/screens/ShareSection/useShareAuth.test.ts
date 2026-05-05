import { afterEach, describe, expect, it, vi } from 'vitest';

// We test useShareAuth by calling it as a plain function (no DOM render needed)
// because all hooks it depends on are mocked synchronously.

const mocks = vi.hoisted(() => {
  const openDialog = vi.fn();
  const closeDialog = vi.fn();
  const updateToken = vi.fn();
  const exchangeOAuthCode = vi.fn();
  const initiateSignin = vi.fn();
  return { openDialog, closeDialog, updateToken, exchangeOAuthCode, initiateSignin };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
  };
});

vi.mock('../../utils/graphQLClient', () => ({
  useAccessToken: () => [null, mocks.updateToken],
}));

vi.mock('../../utils/oauthGrant', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/oauthGrant')>();
  return { ...actual, exchangeOAuthCode: mocks.exchangeOAuthCode };
});

vi.mock('../../utils/requestAccessToken', () => ({
  initiateSignin: mocks.initiateSignin,
}));

// Capture the handler registered with useChromaticDialog
let capturedHandler: ((event: any) => Promise<void>) | undefined;
vi.mock('../../utils/useChromaticDialog', () => ({
  useChromaticDialog: (handler: (event: any) => Promise<void>) => {
    capturedHandler = handler;
    return [mocks.openDialog, mocks.closeDialog] as const;
  },
}));

const { useShareAuth } = await import('./useShareAuth');

const defaultParams = {
  clientId: 'client-id',
  redirectUri: 'https://example.com/redirect',
  codeVerifier: 'verifier',
  state: 'state-abc',
  authorizationUrl: 'https://chromatic.com/authorize',
  tokenEndpoint: 'https://chromatic.com/token',
};

afterEach(() => {
  vi.clearAllMocks();
  capturedHandler = undefined;
});

describe('useShareAuth', () => {
  it('successful flow: startSignIn opens dialog, grant code triggers fetchAccessToken and updateToken', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);
    mocks.exchangeOAuthCode.mockResolvedValueOnce('access-token-xyz');

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    expect(mocks.openDialog).toHaveBeenCalledWith(defaultParams.authorizationUrl, [
      new URL(defaultParams.redirectUri).origin,
    ]);

    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });

    expect(mocks.exchangeOAuthCode).toHaveBeenCalledOnce();
    expect(mocks.updateToken).toHaveBeenCalledWith('access-token-xyz');
    expect(setShareState).toHaveBeenCalledWith({ status: 'uploading', shareUrl: '' });
  });

  it('duplicate grant: fetchAccessToken called only once (paramsRef cleared pre-await)', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    let resolveFetch!: (token: string) => void;
    mocks.exchangeOAuthCode.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    // First grant — clears paramsRef, starts fetch
    const first = capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });
    // Second grant — paramsRef is null now, should short-circuit
    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });

    resolveFetch('token');
    await first;

    expect(mocks.exchangeOAuthCode).toHaveBeenCalledOnce();
  });

  it('denied outcome: setShareState reason=cancelled, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    await capturedHandler!({ message: 'grant', denied: true, state: 'state-abc' });

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'cancelled' });
    expect(mocks.exchangeOAuthCode).not.toHaveBeenCalled();
  });

  it('error outcome: setShareState reason=unknown, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    await capturedHandler!({ message: 'grant', error: 'server_error', state: 'state-abc' });

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'unknown' });
  });

  it('stale grant: arriving after paramsRef cleared, no state change or error surfaced', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);
    mocks.exchangeOAuthCode.mockResolvedValueOnce('token');

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    // Complete the flow — clears paramsRef
    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });
    setShareState.mockClear();
    mocks.closeDialog.mockClear();

    // Stale grant arrives after params cleared
    await capturedHandler!({ message: 'grant', denied: true, state: 'state-abc' });

    expect(setShareState).not.toHaveBeenCalled();
    expect(mocks.closeDialog).not.toHaveBeenCalled();
  });

  it('grant with wrong state during active flow: ignored, flow stays in current state', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();
    setShareState.mockClear();

    // Grant with mismatched state — should be ignored
    await capturedHandler!({ message: 'grant', denied: true, state: 'wrong-state' });

    expect(setShareState).not.toHaveBeenCalled();
    expect(mocks.closeDialog).not.toHaveBeenCalled();
    expect(mocks.exchangeOAuthCode).not.toHaveBeenCalled();
  });

  it('login relay: openDialog called again with authorizationUrl', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();
    mocks.openDialog.mockClear();

    await capturedHandler!({ message: 'login' });

    expect(mocks.openDialog).toHaveBeenCalledWith(defaultParams.authorizationUrl, [
      new URL(defaultParams.redirectUri).origin,
    ]);
    expect(mocks.exchangeOAuthCode).not.toHaveBeenCalled();
  });

  it('fetchAccessToken throws: setShareState reason=unknown, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);
    mocks.exchangeOAuthCode.mockRejectedValueOnce(new Error('network error'));

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'unknown' });
  });

  it('initiateSignin throws in startSignIn: setShareState reason=unknown', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockRejectedValueOnce(new Error('network error'));

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'unknown' });
  });
});
