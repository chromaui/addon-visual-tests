import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DriverSnapshot } from '../../utils/signInDriver';

// ---- hoisted mocks ----
const mocks = vi.hoisted(() => {
  const driverInstance: any = {
    flow: 'device-code',
    start: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
  };
  return {
    driverInstance,
    createSignInDriver: vi.fn(() => driverInstance),
    setSnapshot: vi.fn(),
    setScreen: vi.fn(),
    setSubdomain: vi.fn(),
    onError: vi.fn(),
  };
});

// State injected per-test
let snapshotValue: DriverSnapshot | null = null;
let screenValue: 'welcome' | 'signin' | 'subdomain' | 'verify' = 'verify';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => (() => void) | void) => {
      fn();
    },
    useState: (initial: unknown) => [initial, vi.fn()],
  };
});

vi.mock('../../utils/signInDriver', () => ({
  createSignInDriver: () => mocks.createSignInDriver(),
}));

vi.mock('../../utils/useSessionState', () => ({
  useSessionState: vi.fn((key: string) => {
    if (key === 'authenticationScreen') return [screenValue, mocks.setScreen];
    if (key === 'signInSnapshot') return [snapshotValue, mocks.setSnapshot];
    return [undefined, vi.fn()];
  }),
}));

vi.mock('../../utils/useErrorNotification', () => ({
  useErrorNotification: () => mocks.onError,
}));

vi.mock('../../utils/TelemetryContext', () => ({
  useTelemetry: vi.fn(),
}));

vi.mock('../../AuthContext', () => ({
  useAuthState: () => ({ setSubdomain: mocks.setSubdomain }),
}));

vi.mock('../Uninstalled/UninstallContext', () => ({
  useUninstallAddon: () => ({ uninstallAddon: vi.fn() }),
}));

vi.mock('./SetSubdomain', () => ({ SetSubdomain: () => null }));
vi.mock('./SignIn', () => ({ SignIn: () => null }));
vi.mock('./Verify', () => ({ Verify: () => null }));
vi.mock('./Welcome', () => ({ Welcome: () => null }));

const { Authentication } = await import('./Authentication');

beforeEach(() => {
  // Re-create driver instance per test so prior call counts don't leak.
  mocks.driverInstance.flow = 'device-code';
  mocks.driverInstance.start = vi.fn();
  mocks.driverInstance.cancel = vi.fn();
  mocks.driverInstance.resume = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  snapshotValue = null;
  screenValue = 'verify';
});

const invoke = (props: Partial<Parameters<typeof Authentication>[0]> = {}) =>
  (Authentication as any)({
    setAccessToken: vi.fn(),
    setCreatedProjectId: vi.fn(),
    hasProjectId: false,
    ...props,
  });

describe('Authentication remount-with-snapshot behavior', () => {
  it('drops snapshot and returns to signin when snapshot.flow does not match driver.flow', () => {
    mocks.driverInstance.flow = 'device-code';
    snapshotValue = {
      flow: 'authorization-code',
      params: {
        clientId: 'c',
        redirectUri: 'https://r.example/iframe.html',
        codeVerifier: 'v',
        state: 's',
        authorizationUrl: 'https://a.example/authorize',
        tokenEndpoint: 'https://a.example/token',
      },
    };
    screenValue = 'verify';

    invoke();

    expect(mocks.setSnapshot).toHaveBeenCalledWith(null);
    expect(mocks.setScreen).toHaveBeenCalledWith('signin');
    expect(mocks.driverInstance.resume).not.toHaveBeenCalled();
  });

  it('calls driver.resume when snapshot flow matches driver flow', () => {
    mocks.driverInstance.flow = 'device-code';
    mocks.driverInstance.resume = vi.fn(() => new Promise(() => {}));
    snapshotValue = {
      flow: 'device-code',
      deviceCode: 'dc',
      verifier: 'v',
      expires: Date.now() + 60_000,
      interval: 1000,
      userCode: 'ABC123',
      verificationUrl: 'https://www.chromatic.com/verify',
      tokenEndpoint: 'https://www.chromatic.com/token',
    };
    screenValue = 'verify';

    invoke();

    expect(mocks.driverInstance.resume).toHaveBeenCalledOnce();
    const [passedSnapshot] = mocks.driverInstance.resume.mock.calls[0];
    expect(passedSnapshot).toBe(snapshotValue);
    expect(mocks.setSnapshot).not.toHaveBeenCalledWith(null);
  });

  it('returns to signin when verify screen has no snapshot', () => {
    snapshotValue = null;
    screenValue = 'verify';

    invoke();

    expect(mocks.setScreen).toHaveBeenCalledWith('signin');
    expect(mocks.driverInstance.resume).not.toHaveBeenCalled();
  });
});
