import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import type { API } from 'storybook/manager-api';

import { CANCEL_SHARE, GIT_INFO, SHARE_PROGRESS, START_SHARE, TELEMETRY } from '../../constants';
import type { GitInfoPayload, ShareProgress } from '../../types';
import { checkOutdated } from '../../utils/checkOutdated';
import { useAccessToken } from '../../utils/graphQLClient';
import { useSessionState } from '../../utils/useSessionState';
import { useSharedState } from '../../utils/useSharedState';
import { setPresent } from './popoverPresence';
import { applyProgress, initialShareState, shareReducer } from './shareReducer';
import { ShareSectionComplete } from './ShareSectionComplete';
import { ShareSectionError } from './ShareSectionError';
import { ShareSectionIdle } from './ShareSectionIdle';
import { ShareSectionSubdomain } from './ShareSectionSubdomain';
import { ShareSectionUploading } from './ShareSectionUploading';
import { ShareSectionVerifying } from './ShareSectionVerifying';
import { ShareSectionWelcome } from './ShareSectionWelcome';
import type { ShareReducerState } from './types';
import { useShareAuth } from './useShareAuth';

export const ShareSection = ({ api }: { api: API }) => {
  const [token] = useAccessToken();
  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [shareProgress] = useSharedState<ShareProgress>(SHARE_PROGRESS);

  const [persisted, setPersisted] = useSessionState<ShareReducerState>(
    'shareReducer',
    initialShareState
  );
  const [reducerState, dispatch] = useReducer(shareReducer, persisted);

  const [lastCompletedShareUrl, setLastCompletedShareUrl] = useSessionState<string | null>(
    'shareLastCompletedUrl',
    null
  );
  const [lastCompletedGitInfo, setLastCompletedGitInfo] = useSessionState<
    GitInfoPayload | undefined
  >('shareLastCompletedGitInfo', undefined);

  const isRepeatShareRef = useRef(false);
  const prevShareStatusRef = useRef<string>(reducerState.screen.status);

  // Persist reducer state for cross-remount survival.
  useEffect(() => {
    setPersisted(reducerState);
  }, [reducerState, setPersisted]);

  useEffect(() => {
    setPresent(true);
    return () => setPresent(false);
  }, []);

  const emitTelemetry = useCallback(
    (action: string, extra?: Record<string, unknown>) => {
      api.getChannel()?.emit(TELEMETRY, { action, entryPoint: 'toolbar', ...extra });
    },
    [api]
  );

  const sharedUploadInFlight =
    shareProgress?.status === 'pending' || shareProgress?.status === 'uploading';

  const { startSignIn, updateToken } = useShareAuth(dispatch);

  // Auto-skip welcome/idle/subdomain if already signed in and no active share.
  useEffect(() => {
    const skippableStatus =
      reducerState.screen.status === 'welcome' ||
      reducerState.screen.status === 'idle' ||
      reducerState.screen.status === 'subdomain';
    if (token && skippableStatus && !sharedUploadInFlight) {
      dispatch({ type: 'START_UPLOAD', newRequestId: crypto.randomUUID() });
    }
  }, [token, reducerState.screen.status, sharedUploadInFlight]);

  const handlePublish = useCallback(() => {
    if (!token) {
      dispatch({ type: 'BACK_TO_IDLE' });
      return;
    }
    dispatch({ type: 'START_UPLOAD', newRequestId: crypto.randomUUID() });
  }, [token]);

  const handleCancel = useCallback(() => {
    api.getChannel()?.emit(CANCEL_SHARE, { shareRequestId: reducerState.shareRequestId });
    emitTelemetry('share-canceled');
  }, [api, emitTelemetry, reducerState.shareRequestId]);

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
    emitTelemetry,
    screenStatus,
    shareRequestId,
    shareTriggeredId,
    shareProgress,
    sharedUploadInFlight,
    token,
  ]);

  // Telemetry: detect idle -> uploading or verifying -> uploading transition (auth completed).
  useEffect(() => {
    if (
      (prevShareStatusRef.current === 'idle' || prevShareStatusRef.current === 'verifying') &&
      reducerState.screen.status === 'uploading'
    ) {
      emitTelemetry('share-auth-completed');
    }
    prevShareStatusRef.current = reducerState.screen.status;
  }, [emitTelemetry, reducerState.screen.status]);

  // Pipe shareProgress through the reducer; emit telemetry / token updates as side effects.
  useEffect(() => {
    if (!shareProgress) return;
    const { next, effect } = applyProgress(
      reducerState,
      shareProgress,
      gitInfo,
      lastCompletedShareUrl
    );
    if (next !== reducerState) dispatch({ type: 'APPLY_STATE', next });

    switch (effect.kind) {
      case 'url-received':
        emitTelemetry('share-url-received');
        break;
      case 'completed':
        if (effect.isNew) {
          setLastCompletedShareUrl(effect.shareUrl);
          setLastCompletedGitInfo(effect.gitInfo);
          emitTelemetry('share-upload-completed');
        }
        break;
      case 'auth-error':
        updateToken(null);
        emitTelemetry('share-failed');
        break;
      case 'failed':
        emitTelemetry('share-failed');
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareProgress]);

  const screen = reducerState.screen;
  switch (screen.status) {
    case 'welcome':
      return <ShareSectionWelcome onPublish={handlePublish} />;
    case 'idle':
      return (
        <ShareSectionIdle
          onSignIn={() => startSignIn()}
          onSignInWithSSO={() => dispatch({ type: 'GO_SUBDOMAIN' })}
        />
      );
    case 'subdomain':
      return (
        <ShareSectionSubdomain
          onSubmit={(subdomain) => startSignIn(subdomain)}
          onBack={() => dispatch({ type: 'BACK_TO_IDLE' })}
        />
      );
    case 'verifying':
      return (
        <ShareSectionVerifying
          userCode={screen.userCode}
          onGoToChromatic={() => window.open(screen.verificationUrl, '_blank')}
          onBack={() => dispatch({ type: 'BACK_TO_IDLE' })}
        />
      );
    case 'uploading':
      return (
        <ShareSectionUploading
          shareUrl={screen.shareUrl}
          step={shareProgress?.status}
          onCopy={() => emitTelemetry('share-url-copied')}
          onCancel={handleCancel}
        />
      );
    case 'complete':
      return (
        <ShareSectionComplete
          shareUrl={screen.shareUrl}
          publishedAt={screen.publishedAt}
          isOutdated={checkOutdated(lastCompletedGitInfo, gitInfo)}
          onCopy={() => emitTelemetry('share-url-copied')}
          onPublishAgain={() => {
            isRepeatShareRef.current = true;
            dispatch({ type: 'START_UPLOAD', newRequestId: crypto.randomUUID() });
          }}
        />
      );
    case 'error':
      return (
        <ShareSectionError
          reason={screen.reason}
          message={screen.message}
          onRetry={handlePublish}
        />
      );
    default:
      return null;
  }
};
