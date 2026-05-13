import type { GitInfoPayload, ShareProgress } from '../../types';
import type { ProgressEffect, ShareAction, ShareReducerState } from './types';

export const initialState: ShareReducerState = {
  screen: { status: 'welcome' },
  shareRequestId: null,
  shareTriggeredId: null,
};

export function applyProgress(
  state: ShareReducerState,
  progress: ShareProgress,
  gitInfo: GitInfoPayload | undefined,
  lastCompletedShareUrl: string | null
): { next: ShareReducerState; effect: ProgressEffect } {
  // Recover from remount loss: useSessionState debounces persist by 1s and cancels on
  // unmount, so a quick popover close after starting a share can drop the local
  // shareRequestId. Adopt the server's id when we have no active request locally.
  if (
    progress.shareRequestId !== state.shareRequestId &&
    state.shareRequestId === null &&
    progress.shareRequestId
  ) {
    if (progress.status === 'pending' || progress.status === 'uploading') {
      state = {
        ...state,
        shareRequestId: progress.shareRequestId,
        shareTriggeredId: progress.shareRequestId,
        screen: {
          status: 'uploading',
          shareUrl: progress.status === 'uploading' ? (progress.shareUrl ?? '') : '',
        },
      };
    } else if (progress.status === 'complete' && progress.shareUrl !== lastCompletedShareUrl) {
      state = {
        ...state,
        shareRequestId: progress.shareRequestId,
        shareTriggeredId: progress.shareRequestId,
      };
    }
  }

  if (progress.shareRequestId !== state.shareRequestId) {
    return { next: state, effect: { kind: 'none' } };
  }

  if (
    progress.status === 'uploading' &&
    progress.shareUrl &&
    state.screen.status === 'uploading' &&
    progress.shareUrl !== state.screen.shareUrl
  ) {
    return {
      next: { ...state, screen: { status: 'uploading', shareUrl: progress.shareUrl } },
      effect: { kind: 'url-received' },
    };
  }

  if (progress.status === 'complete') {
    const { shareUrl, daysToExpire } = progress;
    return {
      next: {
        ...state,
        screen: { status: 'complete', shareUrl, publishedAt: Date.now(), daysToExpire },
        shareRequestId: null,
        shareTriggeredId: null,
      },
      effect: {
        kind: 'completed',
        shareUrl,
        gitInfo,
        isNew: shareUrl !== lastCompletedShareUrl,
      },
    };
  }

  if (progress.status === 'error') {
    if (progress.canceled) {
      return {
        next: {
          ...state,
          screen: { status: 'error', reason: 'upload-canceled' },
          shareRequestId: null,
          shareTriggeredId: null,
        },
        effect: { kind: 'failed' },
      };
    }
    const isAuthError = /\b(401|403|unauthorized|expired)\b/i.test(progress.error);
    if (isAuthError) {
      return {
        next: {
          ...state,
          screen: { status: 'idle' },
          shareRequestId: null,
          shareTriggeredId: null,
        },
        effect: { kind: 'auth-error' },
      };
    }
    return {
      next: {
        ...state,
        screen: { status: 'error', reason: 'unknown', message: progress.error || undefined },
        shareRequestId: null,
        shareTriggeredId: null,
      },
      effect: { kind: 'failed' },
    };
  }

  return { next: state, effect: { kind: 'none' } };
}

export function shareReducer(state: ShareReducerState, action: ShareAction): ShareReducerState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'PUBLISH_REQUESTED':
      if (action.hasToken) {
        return {
          ...state,
          screen: { status: 'uploading', shareUrl: '' },
          shareRequestId: action.newRequestId,
          shareTriggeredId: null,
        };
      }
      return { ...state, screen: { status: 'idle' } };
    case 'PUBLISH_AGAIN':
      return {
        ...state,
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: action.newRequestId,
        shareTriggeredId: null,
      };
    case 'GO_SUBDOMAIN':
      return { ...state, screen: { status: 'subdomain' } };
    case 'BACK_TO_IDLE':
      return { ...state, screen: { status: 'idle' } };
    case 'AUTO_SKIP_TO_UPLOADING':
      return {
        ...state,
        screen: { status: 'uploading', shareUrl: '' },
        shareRequestId: action.newRequestId,
        shareTriggeredId: null,
      };
    case 'START_SHARE_EMITTED':
      return {
        ...state,
        shareRequestId: action.id,
        shareTriggeredId: action.id,
      };
    case 'APPLY_STATE':
      return action.next;
    default:
      return state;
  }
}
