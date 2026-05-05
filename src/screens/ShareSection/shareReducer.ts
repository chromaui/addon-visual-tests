import type { GitInfoPayload, ShareProgress } from '../../types';
import type { ProgressEffect, ShareAction, ShareReducerState } from './types';

export const initialShareState: ShareReducerState = {
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
    const { shareUrl } = progress;
    return {
      next: {
        ...state,
        screen: { status: 'complete', shareUrl, publishedAt: Date.now() },
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
    case 'START_UPLOAD':
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
    case 'START_SHARE_EMITTED':
      return {
        ...state,
        shareRequestId: action.id,
        shareTriggeredId: action.id,
      };
    case 'APPLY_STATE':
      return action.next;
    case 'VERIFICATION_STARTED':
      return {
        ...state,
        screen: {
          status: 'verifying',
          userCode: action.userCode,
          verificationUrl: action.verificationUrl,
        },
        shareRequestId: null,
        shareTriggeredId: null,
      };
    case 'VERIFICATION_FAILED':
      return {
        ...state,
        screen: { status: 'error', reason: action.reason },
        shareRequestId: null,
        shareTriggeredId: null,
      };
    default:
      return state;
  }
}
