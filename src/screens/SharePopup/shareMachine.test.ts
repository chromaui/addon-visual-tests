import { describe, expect, it } from 'vitest';

import type { ShareProgress } from '../../types';
import { applyProgress, initialState, shareReducer } from './shareMachine';
import type { ShareReducerState } from './types';

const baseState: ShareReducerState = {
  screen: { status: 'uploading', shareUrl: '' },
  shareRequestId: 'req-1',
  shareTriggeredId: 'req-1',
};

describe('shareReducer', () => {
  it('PUBLISH_REQUESTED with token transitions to uploading and assigns the new id', () => {
    const next = shareReducer(initialState, {
      type: 'PUBLISH_REQUESTED',
      hasToken: true,
      newRequestId: 'req-x',
    });
    expect(next.screen).toEqual({ status: 'uploading', shareUrl: '' });
    expect(next.shareRequestId).toBe('req-x');
    expect(next.shareTriggeredId).toBeNull();
  });

  it('PUBLISH_REQUESTED without token falls through to idle', () => {
    const next = shareReducer(initialState, {
      type: 'PUBLISH_REQUESTED',
      hasToken: false,
      newRequestId: 'req-x',
    });
    expect(next.screen).toEqual({ status: 'idle' });
  });

  it('GO_SUBDOMAIN switches to the SSO entry screen', () => {
    const next = shareReducer(
      { ...baseState, screen: { status: 'idle' } },
      { type: 'GO_SUBDOMAIN' }
    );
    expect(next.screen.status).toBe('subdomain');
  });

  it('START_SHARE_EMITTED records the triggered id', () => {
    const next = shareReducer(
      { ...baseState, shareRequestId: 'req-y', shareTriggeredId: null },
      { type: 'START_SHARE_EMITTED', id: 'req-y' }
    );
    expect(next.shareTriggeredId).toBe('req-y');
  });
});

describe('applyProgress', () => {
  it('emits url-received when the uploading url changes', () => {
    const progress: ShareProgress = {
      status: 'uploading',
      shareUrl: 'https://share.example/new',
      shareRequestId: 'req-1',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(effect).toEqual({ kind: 'url-received' });
    if (next.screen.status === 'uploading') {
      expect(next.screen.shareUrl).toBe('https://share.example/new');
    } else {
      throw new Error('expected uploading screen');
    }
  });

  it('emits completed and clears request ids', () => {
    const progress: ShareProgress = {
      status: 'complete',
      shareUrl: 'https://share.example/sb',
      daysToExpire: 7,
      shareRequestId: 'req-1',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(effect.kind).toBe('completed');
    expect(next.shareRequestId).toBeNull();
    expect(next.shareTriggeredId).toBeNull();
  });

  it('classifies 401 errors as auth-error and resets to idle', () => {
    const progress: ShareProgress = {
      status: 'error',
      error: '401 Unauthorized',
      shareRequestId: 'req-1',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(effect).toEqual({ kind: 'auth-error' });
    expect(next.screen).toEqual({ status: 'idle' });
    expect(next.shareRequestId).toBeNull();
  });

  it('classifies generic errors as failed', () => {
    const progress: ShareProgress = {
      status: 'error',
      error: 'boom',
      shareRequestId: 'req-1',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(effect.kind).toBe('failed');
    if (next.screen.status === 'error') {
      expect(next.screen.reason).toBe('unknown');
    } else {
      throw new Error('expected error screen');
    }
  });

  it('classifies canceled errors with the upload-canceled reason', () => {
    const progress: ShareProgress = {
      status: 'error',
      error: 'canceled',
      canceled: true,
      shareRequestId: 'req-1',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(effect).toEqual({ kind: 'failed' });
    if (next.screen.status === 'error') {
      expect(next.screen.reason).toBe('upload-canceled');
    } else {
      throw new Error('expected error screen');
    }
  });

  it('ignores progress with a different shareRequestId when one is active locally', () => {
    const progress: ShareProgress = {
      status: 'uploading',
      shareUrl: 'https://share.example/other',
      shareRequestId: 'other',
    };
    const { next, effect } = applyProgress(baseState, progress, undefined, null);
    expect(next).toBe(baseState);
    expect(effect).toEqual({ kind: 'none' });
  });

  it('adopts the server id and re-enters uploading after a remount-induced loss', () => {
    const orphanedState: ShareReducerState = {
      screen: { status: 'idle' },
      shareRequestId: null,
      shareTriggeredId: null,
    };
    const progress: ShareProgress = {
      status: 'pending',
      shareRequestId: 'server-id',
    };
    const { next } = applyProgress(orphanedState, progress, undefined, null);
    expect(next.shareRequestId).toBe('server-id');
    expect(next.shareTriggeredId).toBe('server-id');
    expect(next.screen.status).toBe('uploading');
  });
});
