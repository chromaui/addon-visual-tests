export type ShareState =
  | { status: 'welcome' }
  | { status: 'idle' }
  | { status: 'subdomain' }
  | { status: 'verifying'; userCode: string; verificationUrl: string }
  | { status: 'uploading'; shareUrl: string }
  | { status: 'complete'; shareUrl: string; publishedAt: number }
  | {
      status: 'error';
      reason: 'upload-canceled' | 'cancelled' | 'expired' | 'unknown';
      message?: string;
    };

import type { GitInfoPayload } from '../../types';

export type ShareReducerState = {
  screen: ShareState;
  shareRequestId: string | null;
  shareTriggeredId: string | null;
};

export type ShareAction =
  | { type: 'START_UPLOAD'; newRequestId: string }
  | { type: 'GO_SUBDOMAIN' }
  | { type: 'BACK_TO_IDLE' }
  | { type: 'START_SHARE_EMITTED'; id: string }
  | { type: 'APPLY_STATE'; next: ShareReducerState }
  | { type: 'VERIFICATION_STARTED'; userCode: string; verificationUrl: string }
  | { type: 'VERIFICATION_FAILED'; reason: 'cancelled' | 'expired' | 'unknown' };

export type ProgressEffect =
  | { kind: 'none' }
  | { kind: 'url-received' }
  | { kind: 'completed'; shareUrl: string; gitInfo: GitInfoPayload | undefined; isNew: boolean }
  | { kind: 'auth-error' }
  | { kind: 'failed' };
