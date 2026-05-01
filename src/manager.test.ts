import { afterEach, describe, expect, it, vi } from 'vitest';

const storybookMocks = vi.hoisted(() => {
  const api = {
    on: vi.fn(),
    setSelectedPanel: vi.fn(),
    togglePanel: vi.fn(),
  };

  const addons = {
    register: vi.fn((_: string, callback: (api: typeof api) => void) => callback(api)),
    add: vi.fn(),
  };

  const statusStore = {
    onSelect: vi.fn(),
  };

  return {
    addons,
    api,
    experimental_getStatusStore: vi.fn(() => statusStore),
    statusStore,
  };
});

vi.mock('storybook/manager-api', () => ({
  addons: storybookMocks.addons,
  experimental_getStatusStore: storybookMocks.experimental_getStatusStore,
}));

vi.mock('storybook/internal/types', () => ({
  Addon_TypesEnum: {
    TOOL: 'tool',
    PANEL: 'panel',
    experimental_TEST_PROVIDER: 'experimental-test-provider',
  },
}));

vi.mock('./components/GlobalIgnoreToggle.tsx', () => ({
  GlobalIgnoreToggle: () => null,
}));

vi.mock('./Panel', () => ({
  Panel: () => null,
}));

vi.mock('./TestProviderRender', () => ({
  TestProviderRender: () => null,
}));

function stubWindow(search = '', opener: Record<string, unknown> | null = null) {
  const windowMock = {
    opener,
    location: {
      origin: 'https://example.com',
      search,
    },
    close: vi.fn(),
    open: vi.fn(),
  };

  vi.stubGlobal('window', windowMock);

  return windowMock;
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  delete (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE;
});

describe('manager', () => {
  it('posts OAuth grant message and closes window on successful redirect', async () => {
    const opener = { closed: false, postMessage: vi.fn() };
    const windowMock = stubWindow('?code=grant-code&state=abc123', opener);
    (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

    await import('./manager');

    expect(opener.postMessage).toHaveBeenCalledWith(
      { message: 'grant', code: 'grant-code', state: 'abc123' },
      windowMock.location.origin
    );
    expect(windowMock.close).toHaveBeenCalledOnce();
  });
});
