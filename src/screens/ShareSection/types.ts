export type ShareState =
  | { status: 'welcome' }
  | { status: 'idle' }
  | { status: 'subdomain' }
  | { status: 'uploading'; shareUrl: string }
  | { status: 'complete'; shareUrl: string; publishedAt: number }
  | {
      status: 'error';
      reason: 'cancelled' | 'upload-cancelled' | 'expired' | 'unknown' | 'auth';
      message?: string;
    };

import type { GitInfoPayload, ShareProgress } from '../../types';

export type ShareReducerState = {
  screen: ShareState;
  shareRequestId: string | null;
  shareTriggeredId: string | null;
  awaitingFreshProgress: boolean;
};

export type ShareAction =
  | { type: 'SET_SCREEN'; screen: ShareState }
  | { type: 'PUBLISH_REQUESTED'; hasToken: boolean; newRequestId: string }
  | { type: 'PUBLISH_AGAIN'; newRequestId: string }
  | { type: 'GO_SUBDOMAIN' }
  | { type: 'BACK_TO_IDLE' }
  | { type: 'AUTO_SKIP_TO_UPLOADING'; newRequestId: string }
  | { type: 'START_SHARE_EMITTED'; id: string }
  | {
      type: 'PROGRESS_RECEIVED';
      progress: ShareProgress;
      gitInfo: GitInfoPayload | undefined;
      lastCompletedShareUrl: string | null;
    };

export type ProgressEffect =
  | { kind: 'none' }
  | { kind: 'url-received' }
  | { kind: 'completed'; shareUrl: string; gitInfo: GitInfoPayload | undefined; isNew: boolean }
  | { kind: 'auth-error' }
  | { kind: 'failed' };
