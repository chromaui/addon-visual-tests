import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DriverSnapshot, SignInDriver } from '../../utils/signInDriver';

// We test useShareAuth by invoking it as a plain function with mocked react primitives.

const mocks = vi.hoisted(() => {
  const openDialog = vi.fn();
  const closeDialog = vi.fn();
  const updateToken = vi.fn();
  const createSignInDriver = vi.fn();
  const setSnapshot = vi.fn();
  return { openDialog, closeDialog, updateToken, createSignInDriver, setSnapshot };
});

const effects: Array<() => void | (() => void)> = [];

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => void | (() => void)) => {
      effects.push(fn);
    },
  };
});

vi.mock('../../utils/graphQLClient', () => ({
  useAccessToken: () => [null, mocks.updateToken],
}));

let snapshotValue: DriverSnapshot | null = null;
vi.mock('../../utils/useSessionState', () => ({
  useSessionState: () => [snapshotValue, mocks.setSnapshot] as const,
}));

let capturedDialogHandler: ((event: any) => Promise<void>) | undefined;
vi.mock('../../utils/useChromaticDialog', () => ({
  useChromaticDialog: (handler: (event: any) => Promise<void>) => {
    capturedDialogHandler = handler;
    return [mocks.openDialog, mocks.closeDialog] as const;
  },
}));

vi.mock('../../utils/signInDriver', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/signInDriver')>();
  return { ...actual, createSignInDriver: mocks.createSignInDriver };
});

const { useShareAuth } = await import('./useShareAuth');

const flushEffects = () => {
  while (effects.length) {
    const fn = effects.shift()!;
    fn();
  }
};

const flushMicrotasks = async () => {
  // allow promise microtasks to drain
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

const makeDeviceCodeDriver = () => {
  let resolveToken!: (token: string) => void;
  let rejectToken!: (err: unknown) => void;
  const tokenPromise = new Promise<string>((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
  });
  // Avoid unhandled rejection
  tokenPromise.catch(() => {});

  const driver: SignInDriver = {
    flow: 'device-code',
    start: vi.fn(async (opts) => {
      opts.dispatch?.({
        type: 'VERIFICATION_STARTED',
        userCode: 'AB12CD',
        verificationUrl: 'https://chromatic.com/verify',
      });
      opts.onSnapshot?.({
        flow: 'device-code',
        deviceCode: 'd',
        verifier: 'v',
        expires: Date.now() + 60_000,
        interval: 1000,
        userCode: 'AB12CD',
        verificationUrl: 'https://chromatic.com/verify',
        tokenEndpoint: 'https://chromatic.com/token',
      });
      return {
        affordance: { userCode: 'AB12CD', verificationUrl: 'https://chromatic.com/verify' },
        token: tokenPromise,
      };
    }),
    resume: vi.fn(async () => ({ token: tokenPromise })),
    cancel: vi.fn(),
  };

  return { driver, resolveToken, rejectToken };
};

const makeAuthCodeDriver = () => {
  let resolveToken!: (token: string) => void;
  let rejectToken!: (err: unknown) => void;
  const tokenPromise = new Promise<string>((resolve, reject) => {
    resolveToken = resolve;
    rejectToken = reject;
  });
  tokenPromise.catch(() => {});

  const driver: SignInDriver & { handleDialogEvent: any } = {
    flow: 'authorization-code',
    start: vi.fn(async (opts) => {
      opts.onSnapshot?.({
        flow: 'authorization-code',
        params: {
          clientId: 'cid',
          redirectUri: 'https://example.com/redirect',
          codeVerifier: 'v',
          state: 'state-abc',
          authorizationUrl: 'https://chromatic.com/authorize',
          tokenEndpoint: 'https://chromatic.com/token',
        },
      });
      return { token: tokenPromise };
    }),
    cancel: vi.fn(),
    handleDialogEvent: vi.fn(async () => ({ kind: 'code', code: 'auth' })),
  };

  return { driver, resolveToken, rejectToken };
};

beforeEach(() => {
  effects.length = 0;
  snapshotValue = null;
  capturedDialogHandler = undefined;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useShareAuth (device-code flow)', () => {
  it('start dispatches VERIFICATION_STARTED then START_UPLOAD on token resolve', async () => {
    const { driver, resolveToken } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    const dispatch = vi.fn();
    const { startSignIn } = useShareAuth(dispatch);
    flushEffects();

    await (startSignIn as () => Promise<void>)();
    await flushMicrotasks();

    expect(dispatch).toHaveBeenCalledWith({
      type: 'VERIFICATION_STARTED',
      userCode: 'AB12CD',
      verificationUrl: 'https://chromatic.com/verify',
    });

    resolveToken('access-token-xyz');
    await flushMicrotasks();

    const completed = dispatch.mock.calls.find(([a]) => a.type === 'START_UPLOAD');
    expect(completed).toBeTruthy();
    expect(completed![0].newRequestId).toEqual(expect.any(String));
    expect(mocks.updateToken).toHaveBeenCalledWith('access-token-xyz');
  });

  it('token rejection dispatches VERIFICATION_FAILED with cancelled reason', async () => {
    const { driver, rejectToken } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    const dispatch = vi.fn();
    const { startSignIn } = useShareAuth(dispatch);
    flushEffects();

    await (startSignIn as () => Promise<void>)();
    await flushMicrotasks();

    const abortErr: any = new Error('aborted');
    abortErr.name = 'AbortError';
    rejectToken(abortErr);
    await flushMicrotasks();

    const failed = dispatch.mock.calls.find(([a]) => a.type === 'VERIFICATION_FAILED');
    expect(failed).toBeTruthy();
    expect(failed![0].reason).toBe('cancelled');
  });

  it('rejects a second concurrent startSignIn', async () => {
    const { driver } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    const dispatch = vi.fn();
    const { startSignIn } = useShareAuth(dispatch);
    flushEffects();

    await (startSignIn as () => Promise<void>)();
    await (startSignIn as () => Promise<void>)();

    expect(driver.start).toHaveBeenCalledTimes(1);
  });

  it('mount with matching device-code snapshot resumes', async () => {
    const { driver } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    snapshotValue = {
      flow: 'device-code',
      deviceCode: 'd',
      verifier: 'v',
      expires: Date.now() + 60_000,
      interval: 1000,
      userCode: 'AB12CD',
      verificationUrl: 'https://chromatic.com/verify',
      tokenEndpoint: 'https://chromatic.com/token',
    };

    const dispatch = vi.fn();
    useShareAuth(dispatch);
    flushEffects();
    await flushMicrotasks();

    expect(driver.resume).toHaveBeenCalledTimes(1);
  });

  it('mount with mismatched-flow snapshot drops snapshot without resume', async () => {
    const { driver } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    snapshotValue = {
      flow: 'authorization-code',
      params: {
        clientId: 'cid',
        redirectUri: 'https://example.com/redirect',
        codeVerifier: 'v',
        state: 's',
        authorizationUrl: 'https://chromatic.com/authorize',
        tokenEndpoint: 'https://chromatic.com/token',
      },
    } as DriverSnapshot;

    const dispatch = vi.fn();
    useShareAuth(dispatch);
    flushEffects();
    await flushMicrotasks();

    expect(driver.resume).not.toHaveBeenCalled();
    expect(mocks.setSnapshot).toHaveBeenCalledWith(null);
  });

  it('cleanup effect calls driver.cancel on unmount', () => {
    const { driver } = makeDeviceCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    const dispatch = vi.fn();
    useShareAuth(dispatch);

    // First effect is mount-resume, second is cleanup. Run both and capture cleanup return.
    const cleanupFns: Array<() => void> = [];
    while (effects.length) {
      const fn = effects.shift()!;
      const ret = fn();
      if (typeof ret === 'function') cleanupFns.push(ret);
    }
    cleanupFns.forEach((c) => c());

    expect(driver.cancel).toHaveBeenCalledTimes(1);
  });
});

describe('useShareAuth (auth-code flow)', () => {
  it('start opens dialog via onSnapshot and resolves token', async () => {
    const { driver, resolveToken } = makeAuthCodeDriver();
    mocks.createSignInDriver.mockReturnValue(driver);

    const dispatch = vi.fn();
    const { startSignIn } = useShareAuth(dispatch);
    flushEffects();

    await (startSignIn as () => Promise<void>)();
    await flushMicrotasks();

    expect(mocks.openDialog).toHaveBeenCalledWith('https://chromatic.com/authorize', [
      new URL('https://example.com/redirect').origin,
    ]);

    // dispatch into dialog handler should call driver.handleDialogEvent
    await capturedDialogHandler!({ message: 'grant', code: 'auth', state: 'state-abc' });
    expect(driver.handleDialogEvent).toHaveBeenCalled();

    resolveToken('access-token-xyz');
    await flushMicrotasks();

    const completed = dispatch.mock.calls.find(([a]) => a.type === 'START_UPLOAD');
    expect(completed).toBeTruthy();
    expect(mocks.updateToken).toHaveBeenCalledWith('access-token-xyz');
  });
});
