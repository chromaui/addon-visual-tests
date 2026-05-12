import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ShareProgress } from '../../types';
import type { ShareReducerState, ShareState } from './types';

// ---- hoisted mocks ----
const mocks = vi.hoisted(() => {
  const channel = { emit: vi.fn(), on: vi.fn(), off: vi.fn() };
  const updateToken = vi.fn();
  const dispatch = vi.fn();
  const refresh = vi.fn(() => Promise.resolve());
  return { channel, updateToken, dispatch, refresh };
});

// Mutable per-test reducer state
let reducerState: ShareReducerState = {
  screen: { status: 'uploading', shareUrl: '' } as ShareState,
  shareRequestId: null,
  shareTriggeredId: null,
};
let shareProgressValue: ShareProgress | undefined = undefined;

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
    // useEffect: run synchronously so effects fire during the "render" call
    useEffect: (fn: () => (() => void) | void) => {
      fn();
    },
    useState: (initial: unknown) => [initial, vi.fn()],
    useReducer: () => [reducerState, mocks.dispatch],
  };
});

vi.mock('storybook/manager-api', () => ({
  useAddonState: vi.fn((key: string, initial: any) => [initial, vi.fn()]),
  useStorybookApi: () => ({ getChannel: () => mocks.channel }),
}));

vi.mock('../../utils/graphQLClient', () => ({
  useAccessToken: () => ['token-123', mocks.updateToken],
}));

vi.mock('../../auth/authStore', () => ({
  authStore: { refresh: mocks.refresh },
}));

vi.mock('../../utils/useSessionState', () => ({
  useSessionState: vi.fn((_key: string, initial: any) => [initial, vi.fn()]),
}));

vi.mock('../../utils/useSharedState', () => ({
  useSharedState: vi.fn((key: string) => {
    if (key.endsWith('shareProgress')) return [shareProgressValue, vi.fn()];
    return [undefined, vi.fn()];
  }),
}));

vi.mock('./useShareAuth', () => ({
  useShareAuth: () => ({ startSignIn: vi.fn(), updateToken: mocks.updateToken }),
}));

vi.mock('./popoverPresence', () => ({
  setPresent: vi.fn(),
  isPresent: () => false,
}));

vi.mock('./SharePopupWelcome', () => ({ SharePopupWelcome: vi.fn() }));
vi.mock('./SharePopupIdle', () => ({ SharePopupIdle: vi.fn() }));
vi.mock('./SharePopupSubdomain', () => ({ SharePopupSubdomain: vi.fn() }));
vi.mock('./SharePopupUploading', () => ({ SharePopupUploading: vi.fn() }));
vi.mock('./SharePopupComplete', () => ({ SharePopupComplete: vi.fn() }));
vi.mock('./SharePopupError', () => ({ SharePopupError: vi.fn() }));

vi.mock('../../utils/SharedState', () => ({
  SharedState: { subscribe: vi.fn(() => ({ value: undefined, on: vi.fn(), off: vi.fn() })) },
}));

vi.mock('../../utils/checkOutdated', () => ({ checkOutdated: vi.fn(() => false) }));

// Import after mocks — we only exercise effects, no DOM render needed
const { SharePopup } = await import('./SharePopup');

function makeApi() {
  return {
    getChannel: () => mocks.channel,
    addNotification: vi.fn(),
  } as any;
}

// Call the component as a plain function to trigger all useEffect calls
function invokeSharePopup() {
  (SharePopup as any)({ api: makeApi() });
}

function setReducer(partial: Partial<ShareReducerState>) {
  reducerState = {
    screen: { status: 'uploading', shareUrl: '' },
    shareRequestId: null,
    shareTriggeredId: null,
    ...partial,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  reducerState = {
    screen: { status: 'uploading', shareUrl: '' },
    shareRequestId: null,
    shareTriggeredId: null,
  };
  shareProgressValue = undefined;
});

describe('SharePopup', () => {
  describe('stale shareProgress filtering by shareRequestId', () => {
    it('ignores progress with a different shareRequestId when one is active locally', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
        shareTriggeredId: 'req-1',
      });
      shareProgressValue = {
        status: 'uploading',
        shareUrl: 'https://share.example.com/new',
        shareRequestId: 'other-request-id',
      };

      invokeSharePopup();

      const urlReceivedEmits = mocks.channel.emit.mock.calls.filter(
        ([, payload]) => payload?.action === 'share-url-received'
      );
      expect(urlReceivedEmits).toHaveLength(0);
    });
  });

  describe('auth-class server error', () => {
    it('refreshes the session on unauthorized error and does not clear the token', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
      });
      shareProgressValue = { status: 'error', error: 'unauthorized', shareRequestId: 'req-1' };

      invokeSharePopup();

      expect(mocks.refresh).toHaveBeenCalledOnce();
      expect(mocks.updateToken).not.toHaveBeenCalled();
      const retryEmits = mocks.channel.emit.mock.calls.filter(
        ([, payload]) => payload?.action === 'share-auth-retry'
      );
      expect(retryEmits.length).toBeGreaterThanOrEqual(1);
    });

    it('refreshes the session on 401 error and does not clear the token', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
      });
      shareProgressValue = {
        status: 'error',
        error: '401 Unauthorized',
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      expect(mocks.refresh).toHaveBeenCalledOnce();
      expect(mocks.updateToken).not.toHaveBeenCalled();
    });
  });

  describe('generic backend error', () => {
    it('dispatches PROGRESS_RECEIVED and emits share-failed telemetry', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
      });
      shareProgressValue = {
        status: 'error',
        error: 'Something went wrong on our end',
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      const failedEmits = mocks.channel.emit.mock.calls.filter(
        ([, payload]) => payload?.action === 'share-failed'
      );
      expect(failedEmits.length).toBeGreaterThanOrEqual(1);
      // updateToken should NOT be called for non-auth errors
      expect(mocks.updateToken).not.toHaveBeenCalled();
    });
  });

  describe('canceled share', () => {
    it('does NOT call updateToken(null) for canceled errors', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
      });
      shareProgressValue = {
        status: 'error',
        error: 'canceled',
        canceled: true,
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      expect(mocks.updateToken).not.toHaveBeenCalled();
    });
  });

  describe('remount restart guard', () => {
    it('does not re-emit START_SHARE when shareProgress is complete for the same id', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
        shareTriggeredId: null,
      });
      shareProgressValue = {
        status: 'complete',
        shareUrl: 'https://share.example.com/sb',
        daysToExpire: 7,
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      const startShareEmits = mocks.channel.emit.mock.calls.filter(
        ([event]) => event && event.endsWith('startShare')
      );
      expect(startShareEmits).toHaveLength(0);
    });

    it('does not re-emit START_SHARE when triggeredId already matches shareRequestId', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
        shareTriggeredId: 'req-1',
      });
      shareProgressValue = undefined;

      invokeSharePopup();

      const startShareEmits = mocks.channel.emit.mock.calls.filter(
        ([event]) => event && event.endsWith('startShare')
      );
      expect(startShareEmits).toHaveLength(0);
    });
  });

  describe('terminal-progress passthrough', () => {
    it('terminal complete progress for matching shareRequestId emits share-upload-completed', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
        shareTriggeredId: 'req-1',
      });
      shareProgressValue = {
        status: 'complete',
        shareUrl: 'https://share.example.com/sb',
        daysToExpire: 7,
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      const completedEmits = mocks.channel.emit.mock.calls.filter(
        ([, payload]) => payload?.action === 'share-upload-completed'
      );
      expect(completedEmits.length).toBeGreaterThanOrEqual(1);
    });

    it('terminal error progress for matching shareRequestId emits share-failed', () => {
      setReducer({
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: 'req-1',
        shareTriggeredId: 'req-1',
      });
      shareProgressValue = {
        status: 'error',
        error: 'boom',
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      const failedEmits = mocks.channel.emit.mock.calls.filter(
        ([, payload]) => payload?.action === 'share-failed'
      );
      expect(failedEmits.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('welcome auto-skip when authenticated', () => {
    it('dispatches AUTO_SKIP_TO_UPLOADING when token is present and welcome', () => {
      setReducer({ screen: { status: 'welcome' } });
      shareProgressValue = undefined;

      invokeSharePopup();

      const autoSkipDispatches = mocks.dispatch.mock.calls.filter(
        ([action]) => action?.type === 'AUTO_SKIP_TO_UPLOADING'
      );
      expect(autoSkipDispatches.length).toBeGreaterThanOrEqual(1);
    });

    it('does NOT auto-skip welcome when an upload is in flight', () => {
      setReducer({ screen: { status: 'welcome' } });
      shareProgressValue = {
        status: 'uploading',
        shareUrl: 'https://share.example.com/sb',
        shareRequestId: 'req-1',
      };

      invokeSharePopup();

      const autoSkipDispatches = mocks.dispatch.mock.calls.filter(
        ([action]) => action?.type === 'AUTO_SKIP_TO_UPLOADING'
      );
      expect(autoSkipDispatches).toHaveLength(0);
    });
  });

  describe('complete state — Delete link regression guard', () => {
    it('renders SharePopupComplete without onDelete prop', async () => {
      const { SharePopupComplete } = await import('./SharePopupComplete');
      setReducer({
        screen: {
          status: 'complete',
          shareUrl: 'https://share.example.com/sb',
          publishedAt: Date.now(),
          daysToExpire: 7,
        },
      });

      const tree = (SharePopup as any)({ api: makeApi() });
      const completeElement = findElement(tree, SharePopupComplete);
      expect(completeElement).toBeTruthy();
      expect(completeElement!.props).not.toHaveProperty('onDelete');
    });
  });
});

function findElement(node: any, type: unknown): any {
  if (!node || typeof node !== 'object') return null;
  if (node.type === type) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findElement(child, type);
      if (found) return found;
    }
  } else if (children) {
    return findElement(children, type);
  }
  return null;
}
