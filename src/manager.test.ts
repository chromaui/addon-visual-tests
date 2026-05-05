import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
});

const storybookMocks = vi.hoisted(() => {
  const api = {
    on: vi.fn(),
    setSelectedPanel: vi.fn(),
    togglePanel: vi.fn(),
    getChannel: vi.fn(() => null),
    addNotification: vi.fn(),
  };

  const addons = {
    register: vi.fn((_: string, callback: (managerApi: typeof api) => void) => callback(api)),
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

vi.mock('./screens/ShareSection', () => ({
  ShareToolbarButton: () => null,
}));

vi.mock('./screens/ShareSection/popoverPresence', () => ({
  isPresent: () => false,
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
  describe('OAuth redirect handler', () => {
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

    it('posts error message and closes window on error redirect', async () => {
      const opener = { closed: false, postMessage: vi.fn() };
      const windowMock = stubWindow(
        '?error=access_denied&error_description=User+denied&state=xyz',
        opener
      );
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      expect(opener.postMessage).toHaveBeenCalledWith(
        {
          message: 'grant',
          error: 'access_denied',
          error_description: 'User denied',
          state: 'xyz',
        },
        windowMock.location.origin
      );
      expect(windowMock.close).toHaveBeenCalledOnce();
    });

    it('does not post when error is present but state is missing', async () => {
      const opener = { closed: false, postMessage: vi.fn() };
      const windowMock = stubWindow('?error=server_error', opener);
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      expect(opener.postMessage).not.toHaveBeenCalled();
      expect(windowMock.close).not.toHaveBeenCalled();
    });

    it('does not post message when opener is null', async () => {
      stubWindow('?code=grant-code&state=abc123', null);
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      // No postMessage call since there's no opener
      // If we got here without throwing, the handler correctly skipped
    });

    it('does not post message when opener is closed', async () => {
      const opener = { closed: true, postMessage: vi.fn() };
      stubWindow('?code=grant-code&state=abc123', opener);
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      expect(opener.postMessage).not.toHaveBeenCalled();
    });

    it('does not post message when query params are irrelevant', async () => {
      const opener = { closed: false, postMessage: vi.fn() };
      stubWindow('?foo=bar', opener);
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      expect(opener.postMessage).not.toHaveBeenCalled();
    });

    it('does not post when code is present but state is missing', async () => {
      const opener = { closed: false, postMessage: vi.fn() };
      stubWindow('?code=grant-code', opener);
      (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE = 'PRODUCTION';

      await import('./manager');

      expect(opener.postMessage).not.toHaveBeenCalled();
    });
  });
});
