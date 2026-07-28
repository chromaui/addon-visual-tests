import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GIT_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  LOCAL_BUILD_PROGRESS,
  REMOVE_ADDON,
  SHARE_PROGRESS,
} from './constants';

const mocks = vi.hoisted(() => {
  const component = () => null;
  return {
    GitError: component,
    emit: vi.fn(),
  };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const useCallback = (callback: unknown) => callback;
  const useEffect = vi.fn();
  const useRef = (current: unknown) => ({ current });
  const defaultExport = (actual as typeof actual & { default?: typeof actual }).default ?? actual;
  return {
    ...actual,
    default: { ...defaultExport, useCallback, useEffect, useRef },
    useCallback,
    useEffect,
    useRef,
  };
});

vi.mock('storybook/manager-api', () => ({
  experimental_getStatusStore: () => ({ set: vi.fn(), unset: vi.fn() }),
  useChannel: () => mocks.emit,
  useStorybookApi: () => ({ addNotification: vi.fn() }),
  useStorybookState: () => ({ storyId: 'button--primary' }),
}));

vi.mock('storybook/theming', () => ({ color: { negative: 'red' } }));
vi.mock('@storybook/icons', () => ({ FailedIcon: () => null }));

vi.mock('./AuthContext', () => ({ AuthProvider: 'div' }));
vi.mock('./components/design-system', () => ({ Spinner: 'span' }));
vi.mock('./screens/Authentication/Authentication', () => ({ Authentication: 'div' }));
vi.mock('./screens/Errors/GitError', () => ({ GitError: mocks.GitError }));
vi.mock('./screens/Errors/InvalidProjectId', () => ({ InvalidProjectId: 'div' }));
vi.mock('./screens/LinkProject/LinkedProject', () => ({ LinkedProject: 'div' }));
vi.mock('./screens/LinkProject/LinkingProjectFailed', () => ({ LinkingProjectFailed: 'div' }));
vi.mock('./screens/LinkProject/LinkProject', () => ({ LinkProject: 'div' }));
vi.mock('./screens/NoDevServer/NoDevServer', () => ({ NoDevServer: 'div' }));
vi.mock('./screens/NoNetwork/NoNetwork', () => ({ NoNetwork: 'div' }));
vi.mock('./screens/Uninstalled/UninstallContext', () => ({ UninstallProvider: 'div' }));
vi.mock('./screens/Uninstalled/Uninstalled', () => ({ Uninstalled: 'div' }));
vi.mock('./screens/VisualTests/ControlsContext', () => ({ ControlsProvider: 'div' }));
vi.mock('./screens/VisualTests/RunBuildContext', () => ({ RunBuildProvider: 'div' }));
vi.mock('./screens/VisualTests/VisualTests', () => ({ VisualTests: 'div' }));

vi.mock('./utils/graphQLClient', () => ({
  createClient: () => ({}),
  GraphQLClientProvider: 'div',
  sessionExpiredEventName: 'session-expired',
  useAccessToken: () => ['access-token', vi.fn()],
}));
vi.mock('./utils/isValidProjectId', () => ({ isValidProjectId: () => true }));
vi.mock('./utils/TelemetryContext', () => ({ TelemetryProvider: 'div' }));
vi.mock('./utils/useBuildEvents', () => ({
  useBuildEvents: () => ({ isRunning: false, startBuild: vi.fn(), stopBuild: vi.fn() }),
}));
vi.mock('./utils/useChannelFetch', () => ({ useChannelFetch: () => vi.fn() }));
vi.mock('./utils/useProjectId', () => ({
  useProjectId: () => ({
    loading: false,
    projectId: 'Project:123',
    updateProject: vi.fn(),
    clearProjectIdUpdated: vi.fn(),
  }),
}));
vi.mock('./utils/useSessionState', () => ({
  clearSessionState: vi.fn(),
  useSessionState: (_key: string, initial?: unknown) => [initial, vi.fn()],
}));
vi.mock('./utils/useSharedState', () => ({
  useSharedState: (key: string) => {
    if (key === GIT_INFO || key === GIT_INFO_ERROR || key === LOCAL_BUILD_PROGRESS) {
      return [undefined, vi.fn()];
    }
    if (key === IS_OFFLINE || key === REMOVE_ADDON) return [false, vi.fn()];
    if (key === SHARE_PROGRESS) return [undefined, vi.fn()];
    return [undefined, vi.fn()];
  },
}));

const { Panel } = await import('./Panel');

function findElement(node: any, type: unknown): any {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === type) return node;
  const children = node.props?.children;
  const childList = Array.isArray(children) ? children : [children];
  return childList.map((child) => findElement(child, type)).find(Boolean);
}

describe('Panel Git info loading', () => {
  beforeEach(() => {
    globalThis.CONFIG_TYPE = 'DEVELOPMENT';
  });

  it.fails('does not render GitError before Git info has resolved', () => {
    const tree = Panel({ active: true });

    expect(findElement(tree, mocks.GitError)).toBeUndefined();
  });
});
