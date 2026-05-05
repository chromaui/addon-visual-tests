import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DriverSnapshot, SignInAffordance, SignInDriver } from '../../utils/signInDriver';

// ---- hoisted mocks ----
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  errorNotification: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => (() => void) | void) => {
      fn();
    },
  };
});

vi.mock('urql', () => ({
  useClient: () => ({ query: mocks.query }),
}));

vi.mock('../../utils/useChromaticDialog', () => ({
  useChromaticDialog: () => [vi.fn(), vi.fn()] as const,
}));

vi.mock('../../utils/useErrorNotification', () => ({
  useErrorNotification: () => mocks.errorNotification,
}));

vi.mock('../../utils/graphQLClient', () => ({
  getFetchOptions: vi.fn(() => ({})),
}));

vi.mock('../../components/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) =>
    React.createElement('button', { onClick }, children),
}));
vi.mock('../../components/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));
vi.mock('../../components/Heading', () => ({
  Heading: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h1', null, children),
}));
vi.mock('../../components/Screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));
vi.mock('../../components/Stack', () => ({
  Stack: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));
vi.mock('../../components/Text', () => ({
  Text: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
}));
vi.mock('./AuthHeader', () => ({
  AuthHeader: () => null,
}));

vi.mock('../../gql', () => ({
  graphql: (..._args: unknown[]) => 'VisualTestsProjectCountQuery',
}));

vi.mock('storybook/theming', () => ({
  styled: new Proxy(() => () => 'styled-element', {
    get: () => () => 'styled-element',
  }) as any,
}));

const { Verify } = await import('./Verify');

afterEach(() => {
  vi.clearAllMocks();
});

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const baseDriver: SignInDriver = {
  flow: 'device-code',
  start: vi.fn(),
  cancel: vi.fn(),
};

function invokeVerify(props: Partial<Parameters<typeof Verify>[0]> = {}) {
  const setAccessToken = vi.fn();
  const setCreatedProjectId = vi.fn();
  const onBack = vi.fn();
  const tokenPromise: Promise<string> = props.tokenPromise ?? new Promise(() => {});
  // Attach a noop catch so unfulfilled rejection doesn't surface as unhandled
  tokenPromise.catch(() => {});

  const merged = {
    onBack,
    hasProjectId: false,
    setAccessToken,
    setCreatedProjectId,
    driver: baseDriver,
    affordance: undefined as SignInAffordance | undefined,
    snapshot: null as DriverSnapshot | null,
    tokenPromise,
    ...props,
  };
  // Call as plain function so mocked hooks fire synchronously.
  const tree = (Verify as any)(merged);
  return { tree, setAccessToken, setCreatedProjectId, onBack };
}

describe('Verify', () => {
  it('renders Digits when affordance is provided (device-code)', () => {
    const { tree } = invokeVerify({
      affordance: { userCode: 'ABC123', verificationUrl: 'https://example.com' },
    });
    const treeStr = JSON.stringify(tree);
    for (const ch of 'ABC123') {
      expect(treeStr).toContain(`"type":"li","key":"${'ABC123'.indexOf(ch)}-${ch}"`);
    }
  });

  it('does NOT render Digits when affordance is undefined (auth-code)', () => {
    const { tree } = invokeVerify({
      affordance: undefined,
      snapshot: {
        flow: 'authorization-code',
        params: {
          clientId: 'c',
          redirectUri: 'https://r.example/iframe.html',
          codeVerifier: 'v',
          state: 's',
          authorizationUrl: 'https://a.example/authorize',
          tokenEndpoint: 'https://a.example/token',
        },
      },
    });
    const treeStr = JSON.stringify(tree);
    // No userCode characters split into li elements — auth-code path has no digits.
    expect(treeStr).not.toMatch(/"li"/);
  });

  it('awaits tokenPromise and calls setAccessToken on success', async () => {
    mocks.query.mockResolvedValueOnce({
      data: { viewer: { projectCount: 1, accounts: [{ newProjectUrl: null }] } },
    });
    const { setAccessToken } = invokeVerify({
      affordance: { userCode: 'X', verificationUrl: 'https://example.com' },
      tokenPromise: Promise.resolve('access-token-1'),
    });
    await flush();
    await flush();
    expect(setAccessToken).toHaveBeenCalledWith('access-token-1');
  });

  it('calls onError("Login Error", ...) when tokenPromise rejects', async () => {
    const failing = Promise.reject(new Error('boom'));
    failing.catch(() => {});
    invokeVerify({
      affordance: { userCode: 'X', verificationUrl: 'https://example.com' },
      tokenPromise: failing,
    });
    await flush();
    await flush();
    expect(mocks.errorNotification).toHaveBeenCalled();
    const [label, err] = mocks.errorNotification.mock.calls[0];
    expect(label).toBe('Login Error');
    expect((err as Error).message).toBe('boom');
  });
});
