import { useCallback, useEffect, useRef } from 'react';
import type { API } from 'storybook/manager-api';

import { authStore } from '../../auth/authStore';
import { CANCEL_SHARE, START_SHARE, TELEMETRY } from '../../constants';
import type { GitInfoPayload, ShareProgress } from '../../types';
import { applyProgress } from './shareMachine';
import type { ShareAction, ShareReducerState } from './types';

type Params = {
  api: API;
  token: string | null;
  reducerState: ShareReducerState;
  shareProgress: ShareProgress | undefined;
  gitInfo: GitInfoPayload | undefined;
  lastCompletedShareUrl: string | null;
  setLastCompletedShareUrl: (url: string | null) => void;
  setLastCompletedGitInfo: (info: GitInfoPayload | undefined) => void;
  updateToken: (token: string | null) => void;
  dispatch: (action: ShareAction) => void;
};

type EmitTelemetry = (action: string, extra?: Record<string, unknown>) => void;

export function useShareExecution({
  api,
  token,
  reducerState,
  shareProgress,
  gitInfo,
  lastCompletedShareUrl,
  setLastCompletedShareUrl,
  setLastCompletedGitInfo,
  updateToken,
  dispatch,
}: Params) {
  const isRepeatShareRef = useRef(false);
  const prevShareStatusRef = useRef<string>(reducerState.screen.status);
  const authRetriedRef = useRef(false);

  const emitTelemetry = useCallback<EmitTelemetry>(
    (action, extra) => {
      api.getChannel()?.emit(TELEMETRY, { action, entryPoint: 'toolbar', ...extra });
    },
    [api]
  );

  const sharedUploadInFlight =
    shareProgress?.status === 'pending' || shareProgress?.status === 'uploading';

  // Auto-skip welcome/idle/subdomain if already signed in and no active share.
  useEffect(() => {
    const skippableStatus =
      reducerState.screen.status === 'welcome' ||
      reducerState.screen.status === 'idle' ||
      reducerState.screen.status === 'subdomain';
    if (token && skippableStatus && !sharedUploadInFlight) {
      dispatch({ type: 'AUTO_SKIP_TO_UPLOADING', newRequestId: crypto.randomUUID() });
    }
  }, [token, reducerState.screen.status, sharedUploadInFlight, dispatch]);

  // Emit START_SHARE for the active uploading session, with remount guards.
  const screenStatus = reducerState.screen.status;
  const { shareRequestId, shareTriggeredId } = reducerState;
  useEffect(() => {
    if (screenStatus !== 'uploading' || !token || sharedUploadInFlight) return;
    if (shareTriggeredId && shareTriggeredId === shareRequestId) return;
    if (shareProgress?.shareRequestId === shareRequestId && shareProgress?.status === 'complete') {
      return;
    }

    const id = shareRequestId ?? crypto.randomUUID();
    dispatch({ type: 'START_SHARE_EMITTED', id });
    api.getChannel()?.emit(START_SHARE, { accessToken: token, shareRequestId: id });
    emitTelemetry('share-initiated', { isRepeatShare: isRepeatShareRef.current });
    isRepeatShareRef.current = false;
  }, [
    api,
    dispatch,
    emitTelemetry,
    screenStatus,
    shareRequestId,
    shareTriggeredId,
    shareProgress,
    sharedUploadInFlight,
    token,
  ]);

  useEffect(() => {
    if (prevShareStatusRef.current === 'idle' && reducerState.screen.status === 'uploading') {
      emitTelemetry('share-auth-completed');
    }
    prevShareStatusRef.current = reducerState.screen.status;
  }, [emitTelemetry, reducerState.screen.status]);

  const progressCtxRef = useRef({
    reducerState,
    gitInfo,
    lastCompletedShareUrl,
    setLastCompletedShareUrl,
    setLastCompletedGitInfo,
    updateToken,
    dispatch,
    emitTelemetry,
  });
  progressCtxRef.current = {
    reducerState,
    gitInfo,
    lastCompletedShareUrl,
    setLastCompletedShareUrl,
    setLastCompletedGitInfo,
    updateToken,
    dispatch,
    emitTelemetry,
  };

  useEffect(() => {
    if (!shareProgress) return;
    const ctx = progressCtxRef.current;
    const { next, effect } = applyProgress(
      ctx.reducerState,
      shareProgress,
      ctx.gitInfo,
      ctx.lastCompletedShareUrl
    );
    if (next !== ctx.reducerState) ctx.dispatch({ type: 'APPLY_STATE', next });

    switch (effect.kind) {
      case 'url-received':
        ctx.emitTelemetry('share-url-received');
        break;
      case 'completed':
        authRetriedRef.current = false;
        if (effect.isNew) {
          ctx.setLastCompletedShareUrl(effect.shareUrl);
          ctx.setLastCompletedGitInfo(effect.gitInfo);
          ctx.emitTelemetry('share-upload-completed');
        }
        break;
      case 'auth-error':
        if (authRetriedRef.current) {
          authRetriedRef.current = false;
          ctx.updateToken(null);
          ctx.emitTelemetry('share-failed');
        } else {
          authRetriedRef.current = true;
          ctx.emitTelemetry('share-auth-retry');
          void authStore.refresh().catch(() => undefined);
        }
        break;
      case 'failed':
        authRetriedRef.current = false;
        ctx.emitTelemetry('share-failed');
        break;
      default:
        break;
    }
  }, [shareProgress]);

  const handleCancel = useCallback(() => {
    api.getChannel()?.emit(CANCEL_SHARE, { shareRequestId: reducerState.shareRequestId });
    emitTelemetry('share-canceled');
  }, [api, emitTelemetry, reducerState.shareRequestId]);

  const handlePublish = useCallback(() => {
    authRetriedRef.current = false;
    dispatch({
      type: 'PUBLISH_REQUESTED',
      hasToken: Boolean(token),
      newRequestId: crypto.randomUUID(),
    });
  }, [dispatch, token]);

  const handlePublishAgain = useCallback(() => {
    isRepeatShareRef.current = true;
    dispatch({ type: 'PUBLISH_AGAIN', newRequestId: crypto.randomUUID() });
  }, [dispatch]);

  return { emitTelemetry, handleCancel, handlePublish, handlePublishAgain };
}
