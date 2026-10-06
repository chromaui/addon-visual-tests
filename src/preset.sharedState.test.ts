import { getConfiguration, getGitInfo } from 'chromatic/node';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateChromaticConfig } from './utils/updateChromaticConfig';

const VALID_PROJECT_ID = 'Project:6480e1b0042842f149cfd74c';

const mocks = vi.hoisted(() => ({
  states: {} as Record<string, { value: any; listeners: ((value: any) => Promise<void>)[] }>,
}));

vi.mock('chromatic/node', () => ({
  createLogger: vi.fn(() => ({})),
  getConfiguration: vi.fn(async () => ({})),
  getGitInfo: vi.fn(async () => ({ branch: 'main', commit: 'abc' })),
}));

vi.mock('storybook/internal/channels', () => ({}));
vi.mock('storybook/internal/core-server', () => ({
  experimental_getTestProviderStore: vi.fn(() => ({ runWithState: vi.fn(), setState: vi.fn() })),
}));
vi.mock('storybook/internal/telemetry', () => ({ telemetry: vi.fn() }));
vi.mock('storybook/internal/types', () => ({}));

vi.mock('./utils/SharedState', () => ({
  SharedState: {
    subscribe: vi.fn((key: string) => {
      const state = { value: undefined, listeners: [] as ((value: any) => Promise<void>)[] };
      mocks.states[key.split('/').pop()!] = state;
      return {
        get value() {
          return state.value;
        },
        set value(value) {
          state.value = value;
        },
        on: vi.fn((_event: string, listener: (value: any) => Promise<void>) => {
          state.listeners.push(listener);
        }),
        off: vi.fn(),
      };
    }),
  },
}));

vi.mock('./utils/updateChromaticConfig', () => ({ updateChromaticConfig: vi.fn() }));
vi.mock('node:fs', () => ({ watch: vi.fn() }));
vi.mock('node:module', () => ({ createRequire: vi.fn(() => (path: string) => path) }));

async function startServerChannel() {
  const { default: preset } = await import('./preset');
  const channel = { on: vi.fn(), emit: vi.fn(), off: vi.fn() };
  await (preset as any).experimental_serverChannel(channel, {
    configDir: '.storybook',
    presets: { apply: vi.fn(async () => ({})) },
  });
}

async function setProjectInfo(value: { projectId?: string }) {
  await startServerChannel();
  await Promise.all(mocks.states.projectInfo.listeners.map((listener) => listener(value)));
}

beforeEach(() => {
  mocks.states = {};
  vi.resetModules();
  vi.clearAllMocks();
});

describe('preset project info handler', () => {
  it('writes a valid project ID to the config file', async () => {
    await setProjectInfo({ projectId: VALID_PROJECT_ID });

    expect(updateChromaticConfig).toHaveBeenCalledWith(
      'chromatic.config.json',
      expect.objectContaining({ projectId: VALID_PROJECT_ID })
    );
  });

  it('does not write an invalid project ID to the config file', async () => {
    await setProjectInfo({ projectId: '"; malicious' });

    expect(updateChromaticConfig).not.toHaveBeenCalled();
  });
});

describe('preset git info state', () => {
  it('shares only the git fields the manager uses', async () => {
    vi.mocked(getGitInfo).mockResolvedValue({
      slug: 'chromaui/example',
      branch: 'main',
      commit: 'abc',
      committedAt: 1,
      committerEmail: 'committer@example.com',
      committerName: 'Committer',
      uncommittedHash: '',
      userEmail: 'developer@example.com',
      userEmailHash: 'hash',
      repositoryRootDir: '/Users/developer/project',
    });

    await startServerChannel();

    await vi.waitFor(() => expect(mocks.states.gitInfo.value).toBeDefined());
    expect(mocks.states.gitInfo.value).toEqual({
      slug: 'chromaui/example',
      branch: 'main',
      commit: 'abc',
      committedAt: 1,
      uncommittedHash: '',
      userEmailHash: 'hash',
    });
  });
});

describe('preset config info state', () => {
  it('does not share the project token from the config file', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      projectId: VALID_PROJECT_ID,
      projectToken: 'chpt_secret',
    } as any);

    await startServerChannel();

    await vi.waitFor(() => expect(mocks.states.configInfo.value).toBeDefined());
    expect(mocks.states.configInfo.value.configuration).toEqual(
      expect.objectContaining({ projectId: VALID_PROJECT_ID, projectToken: '***' })
    );
    expect(JSON.stringify(mocks.states.configInfo.value)).not.toContain('chpt_secret');
  });
});
