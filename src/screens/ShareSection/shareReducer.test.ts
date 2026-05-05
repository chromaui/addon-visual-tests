import { describe, expect, it } from 'vitest';

import { applyProgress, initialShareState, shareReducer } from './shareReducer';
import type { ShareReducerState } from './types';

describe('shareReducer', () => {
  it('VERIFICATION_STARTED transitions to verifying with userCode/verificationUrl', () => {
    const next = shareReducer(initialShareState, {
      type: 'VERIFICATION_STARTED',
      userCode: 'AB12CD',
      verificationUrl: 'https://chromatic.com/verify?code=AB12CD',
    });

    expect(next.screen).toEqual({
      status: 'verifying',
      userCode: 'AB12CD',
      verificationUrl: 'https://chromatic.com/verify?code=AB12CD',
    });
    expect(next.shareRequestId).toBeNull();
    expect(next.shareTriggeredId).toBeNull();
  });

  it('START_UPLOAD transitions to uploading with fresh shareRequestId', () => {
    const verifying: ShareReducerState = {
      screen: { status: 'verifying', userCode: 'AB12CD', verificationUrl: 'https://x' },
      shareRequestId: null,
      shareTriggeredId: null,
    };
    const next = shareReducer(verifying, {
      type: 'START_UPLOAD',
      newRequestId: 'req-new',
    });

    expect(next.screen).toEqual({ status: 'uploading', shareUrl: '' });
    expect(next.shareRequestId).toBe('req-new');
    expect(next.shareTriggeredId).toBeNull();
  });

  it('VERIFICATION_FAILED transitions to error with reason', () => {
    const verifying: ShareReducerState = {
      screen: { status: 'verifying', userCode: 'AB12CD', verificationUrl: 'https://x' },
      shareRequestId: null,
      shareTriggeredId: null,
    };
    const next = shareReducer(verifying, { type: 'VERIFICATION_FAILED', reason: 'expired' });

    expect(next.screen).toEqual({ status: 'error', reason: 'expired' });
    expect(next.shareRequestId).toBeNull();
    expect(next.shareTriggeredId).toBeNull();
  });
});

describe('applyProgress', () => {
  it('ignores progress for a different request id', () => {
    const uploading: ShareReducerState = {
      screen: { status: 'uploading', shareUrl: '' },
      shareRequestId: 'req-1',
      shareTriggeredId: 'req-1',
    };
    const { next, effect } = applyProgress(
      uploading,
      { shareRequestId: 'req-2', status: 'uploading', shareUrl: 'https://x' } as any,
      undefined,
      null
    );

    expect(next).toBe(uploading);
    expect(effect).toEqual({ kind: 'none' });
  });
});
