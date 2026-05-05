import React, { useCallback, useEffect, useRef } from 'react';
import type { API } from 'storybook/manager-api';

import { CANCEL_SHARE, GIT_INFO, SHARE_PROGRESS, START_SHARE, TELEMETRY } from '../../constants';
import type { GitInfoPayload, ShareProgress } from '../../types';
import { checkOutdated } from '../../utils/checkOutdated';
import { useAccessToken } from '../../utils/graphQLClient';
import { useSessionState } from '../../utils/useSessionState';
import { useSharedState } from '../../utils/useSharedState';
import { setPresent } from './popoverPresence';
import { ShareSectionComplete } from './ShareSectionComplete';
import { ShareSectionError } from './ShareSectionError';
import { ShareSectionIdle } from './ShareSectionIdle';
import { ShareSectionSubdomain } from './ShareSectionSubdomain';
import { ShareSectionUploading } from './ShareSectionUploading';
import { ShareSectionWelcome } from './ShareSectionWelcome';
import type { ShareState } from './types';
import { useShareAuth } from './useShareAuth';

export const ShareSection = ({ api }: { api: API }) => {
  const [token] = useAccessToken();
  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [shareProgress] = useSharedState<ShareProgress>(SHARE_PROGRESS);
  const [shareState, setShareState] = useSessionState<ShareState>('shareState', {
    status: 'welcome',
  });
  const [shareRequestId, setShareRequestId] = useSessionState<string | null>(
    'shareRequestId',
    null
  );
  const [shareTriggeredId, setShareTriggeredId] = useSessionState<string | null>(
    'shareTriggeredId',
    null
  );
  const [awaitingFreshProgress, setAwaitingFreshProgress] = useSessionState<boolean>(
    'shareAwaitingFreshProgress',
    false
  );
  const [lastCompletedShareUrl, setLastCompletedShareUrl] = useSessionState<string | null>(
    'shareLastCompletedUrl',
    null
  );
  const [lastCompletedGitInfo, setLastCompletedGitInfo] = useSessionState<
    GitInfoPayload | undefined
  >('shareLastCompletedGitInfo', undefined);
  const { startSignIn, updateToken } = useShareAuth(setShareState);
  const isRepeatShareRef = useRef(false);
  const prevShareStatusRef = useRef<string>(shareState.status);

  // Track popover presence so the manager-level subscriber can decide whether
  // to surface a Storybook notification when a share completes.
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
  const currentShareUrl =
    shareState.status === 'uploading' || shareState.status === 'complete'
      ? shareState.shareUrl
      : '';
  const sharedUploadInFlight =
    shareProgress?.status === 'pending' || shareProgress?.status === 'uploading';

  const startNewShareRequest = useCallback(() => {
    const id = crypto.randomUUID();
    setShareRequestId(id);
    setShareTriggeredId(null);
    return id;
  }, [setShareRequestId, setShareTriggeredId]);

  // Auto-skip welcome/idle/subdomain if already signed in and no active share
  useEffect(() => {
    const skippableStatus =
      shareState.status === 'welcome' ||
      shareState.status === 'idle' ||
      shareState.status === 'subdomain';
    if (token && skippableStatus && !sharedUploadInFlight) {
      startNewShareRequest();
      setShareState({ status: 'uploading', shareUrl: '' });
    }
  }, [token, shareState.status, sharedUploadInFlight, setShareState, startNewShareRequest]);

  const handlePublish = useCallback(() => {
    if (token) {
      startNewShareRequest();
      setAwaitingFreshProgress(true);
      setShareState({ status: 'uploading', shareUrl: '' });
    } else {
      setShareState({ status: 'idle' });
    }
  }, [token, setAwaitingFreshProgress, setShareState, startNewShareRequest]);

  const handleCancel = useCallback(() => {
    api.getChannel()?.emit(CANCEL_SHARE, { shareRequestId });
    emitTelemetry('share-cancelled');
  }, [api, emitTelemetry, shareRequestId]);

  useEffect(() => {
    if (shareState.status !== 'uploading' || !token || sharedUploadInFlight) {
      return;
    }
    // Already emitted START_SHARE for this request id (across remounts too).
    if (shareTriggeredId && shareTriggeredId === shareRequestId) {
      return;
    }
    // Backend already finished this request id — don't re-emit.
    if (
      shareProgress?.shareRequestId &&
      shareProgress.shareRequestId === shareRequestId &&
      shareProgress.status === 'complete'
    ) {
      return;
    }

    const id = shareRequestId ?? crypto.randomUUID();
    if (!shareRequestId) setShareRequestId(id);
    setShareTriggeredId(id);
    setAwaitingFreshProgress(true);
    api.getChannel()?.emit(START_SHARE, { accessToken: token, shareRequestId: id });
    emitTelemetry('share-initiated', { isRepeatShare: isRepeatShareRef.current });
    isRepeatShareRef.current = false;
  }, [
    api,
    emitTelemetry,
    setAwaitingFreshProgress,
    setShareRequestId,
    setShareTriggeredId,
    shareProgress,
    shareRequestId,
    shareState.status,
    sharedUploadInFlight,
    shareTriggeredId,
    token,
  ]);

  useEffect(() => {
    if (prevShareStatusRef.current === 'idle' && shareState.status === 'uploading') {
      emitTelemetry('share-auth-completed');
    }
    prevShareStatusRef.current = shareState.status;
  }, [emitTelemetry, shareState.status]);

  useEffect(() => {
    if (!shareProgress) {
      return;
    }

    if (shareProgress.shareRequestId && shareProgress.shareRequestId !== shareRequestId) {
      return;
    }

    const isTerminal = shareProgress.status === 'complete' || shareProgress.status === 'error';

    if (
      (shareProgress.status === 'pending' || shareProgress.status === 'uploading') &&
      awaitingFreshProgress
    ) {
      setAwaitingFreshProgress(false);
    }

    // Terminal updates for the matching shareRequestId always pass through.
    // The gate only filters mid-state updates from prior requests.
    if (awaitingFreshProgress && isTerminal) {
      setAwaitingFreshProgress(false);
    }

    if (
      shareProgress.status === 'uploading' &&
      shareProgress.shareUrl &&
      shareProgress.shareUrl !== currentShareUrl
    ) {
      setShareState({ status: 'uploading', shareUrl: shareProgress.shareUrl });
      emitTelemetry('share-url-received');
      return;
    }

    if (shareProgress.status === 'complete' && shareProgress.shareUrl) {
      const shareUrl = shareProgress.shareUrl;
      setShareState({
        status: 'complete',
        shareUrl,
        publishedAt: Date.now(),
      });
      setShareTriggeredId(null);
      setShareRequestId(null);

      if (shareUrl !== lastCompletedShareUrl) {
        setLastCompletedShareUrl(shareUrl);
        setLastCompletedGitInfo(gitInfo);
        emitTelemetry('share-upload-completed');
      }
      return;
    }

    if (shareProgress.status === 'error') {
      const errorMessage = shareProgress.error ?? '';
      if (shareProgress.cancelled) {
        setShareState({ status: 'error', reason: 'upload-cancelled' });
      } else {
        const isAuthError = /\b(401|403|unauthorized|expired)\b/i.test(errorMessage);
        if (isAuthError) {
          updateToken(null);
          setShareState({ status: 'idle' });
        } else {
          setShareState({
            status: 'error',
            reason: 'unknown',
            message: errorMessage || undefined,
          });
        }
      }
      setShareTriggeredId(null);
      setShareRequestId(null);
      emitTelemetry('share-failed');
    }
  }, [
    awaitingFreshProgress,
    currentShareUrl,
    emitTelemetry,
    gitInfo,
    lastCompletedShareUrl,
    setAwaitingFreshProgress,
    setLastCompletedShareUrl,
    setLastCompletedGitInfo,
    setShareRequestId,
    setShareState,
    setShareTriggeredId,
    shareProgress,
    shareRequestId,
    updateToken,
  ]);

  switch (shareState.status) {
    case 'welcome':
      return <ShareSectionWelcome onPublish={handlePublish} />;
    case 'idle':
      return (
        <ShareSectionIdle
          onSignIn={() => startSignIn()}
          onSignInWithSSO={() => setShareState({ status: 'subdomain' })}
        />
      );
    case 'subdomain':
      return (
        <ShareSectionSubdomain
          onSubmit={(subdomain) => startSignIn(subdomain)}
          onBack={() => setShareState({ status: 'idle' })}
        />
      );
    case 'uploading':
      return (
        <ShareSectionUploading
          shareUrl={shareState.shareUrl}
          progress={shareProgress?.progress}
          step={shareProgress?.status}
          onCopy={() => emitTelemetry('share-url-copied')}
          onCancel={handleCancel}
        />
      );
    case 'complete': {
      const publishedAt = Number.isFinite(shareState.publishedAt)
        ? shareState.publishedAt
        : Date.now();
      return (
        <ShareSectionComplete
          shareUrl={shareState.shareUrl}
          publishedAt={publishedAt}
          isOutdated={checkOutdated(lastCompletedGitInfo, gitInfo)}
          onCopy={() => emitTelemetry('share-url-copied')}
          onPublishAgain={() => {
            isRepeatShareRef.current = true;
            startNewShareRequest();
            setAwaitingFreshProgress(true);
            setShareState({ status: 'uploading', shareUrl: '' });
          }}
        />
      );
    }
    case 'error':
      return (
        <ShareSectionError
          reason={shareState.reason}
          message={shareState.message}
          onRetry={handlePublish}
        />
      );
    default:
      return null;
  }
};
