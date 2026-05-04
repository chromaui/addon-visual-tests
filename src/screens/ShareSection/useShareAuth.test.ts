import { afterEach, describe, expect, it, vi } from 'vitest';

// We test useShareAuth by calling it as a plain function (no DOM render needed)
// because all hooks it depends on are mocked synchronously.

const mocks = vi.hoisted(() => {
  const openDialog = vi.fn();
  const closeDialog = vi.fn();
  const updateToken = vi.fn();
  const fetchAccessToken = vi.fn();
  const initiateSignin = vi.fn();
  return { openDialog, closeDialog, updateToken, fetchAccessToken, initiateSignin };
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

vi.mock('../../utils/requestAccessToken', () => ({
  fetchAccessToken: mocks.fetchAccessToken,
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
    mocks.fetchAccessToken.mockResolvedValueOnce('access-token-xyz');

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    expect(mocks.openDialog).toHaveBeenCalledWith(
      defaultParams.authorizationUrl,
      [new URL(defaultParams.redirectUri).origin]
    );

    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });

    expect(mocks.fetchAccessToken).toHaveBeenCalledOnce();
    expect(mocks.updateToken).toHaveBeenCalledWith('access-token-xyz');
    expect(setShareState).toHaveBeenCalledWith({ status: 'uploading', shareUrl: '' });
  });

  it('duplicate grant: fetchAccessToken called only once (paramsRef cleared pre-await)', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    let resolveFetch!: (token: string) => void;
    mocks.fetchAccessToken.mockReturnValueOnce(
      new Promise((resolve) => { resolveFetch = resolve; })
    );

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    // First grant — clears paramsRef, starts fetch
    const first = capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });
    // Second grant — paramsRef is null now, should short-circuit
    await capturedHandler!({ message: 'grant', code: 'auth-code', state: 'state-abc' });

    resolveFetch('token');
    await first;

    expect(mocks.fetchAccessToken).toHaveBeenCalledOnce();
  });

  it('denied outcome: setShareState reason=cancelled, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    await capturedHandler!({ message: 'grant', denied: true });

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'cancelled' });
    expect(mocks.fetchAccessToken).not.toHaveBeenCalled();
  });

  it('error outcome: setShareState reason=unknown, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();

    await capturedHandler!({ message: 'grant', error: 'server_error' });

    expect(mocks.closeDialog).toHaveBeenCalledOnce();
    expect(setShareState).toHaveBeenCalledWith({ status: 'error', reason: 'unknown' });
  });

  it('login relay: openDialog called again with authorizationUrl', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);

    const { startSignIn } = useShareAuth(setShareState);
    await (startSignIn as () => Promise<void>)();
    mocks.openDialog.mockClear();

    await capturedHandler!({ message: 'login' });

    expect(mocks.openDialog).toHaveBeenCalledWith(
      defaultParams.authorizationUrl,
      [new URL(defaultParams.redirectUri).origin]
    );
    expect(mocks.fetchAccessToken).not.toHaveBeenCalled();
  });

  it('fetchAccessToken throws: setShareState reason=unknown, closeDialog called', async () => {
    const setShareState = vi.fn();
    mocks.initiateSignin.mockResolvedValueOnce(defaultParams);
    mocks.fetchAccessToken.mockRejectedValueOnce(new Error('network error'));

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
