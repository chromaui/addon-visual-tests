import React, { useCallback, useEffect, useRef } from 'react';
import type { API } from 'storybook/manager-api';

import { ADDON_ID, GIT_INFO, SHARE_PROGRESS, START_SHARE, TELEMETRY } from '../../constants';
import type { GitInfoPayload, ShareProgress } from '../../types';
import { checkOutdated } from '../../utils/checkOutdated';
import { useAccessToken } from '../../utils/graphQLClient';
import { useSessionState } from '../../utils/useSessionState';
import { useSharedState } from '../../utils/useSharedState';
import { ShareSectionComplete } from './ShareSectionComplete';
import { ShareSectionError } from './ShareSectionError';
import { ShareSectionIdle } from './ShareSectionIdle';
import { ShareSectionUploading } from './ShareSectionUploading';
import { ShareSectionWelcome } from './ShareSectionWelcome';
import type { ShareState } from './types';
import { useShareAuth } from './useShareAuth';

export const ShareSection = ({ api }: { api: API }) => {
  const [token] = useAccessToken();
  const currentShareRequestIdRef = useRef<string | null>(null);
  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [shareProgress] = useSharedState<ShareProgress>(SHARE_PROGRESS);
  const [shareState, setShareState] = useSessionState<ShareState>('shareState', {
    status: 'welcome',
  });
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
  const shareTriggeredRef = useRef(false);
  const isRepeatShareRef = useRef(false);
  const prevShareStatusRef = useRef<string>(shareState.status);

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

  // Auto-skip idle if already signed in
  useEffect(() => {
    if (token && shareState.status === 'idle') {
      shareTriggeredRef.current = false;
      currentShareRequestIdRef.current = crypto.randomUUID();
      setShareState({ status: 'uploading', shareUrl: '' });
    }
  }, [token, shareState.status, setShareState]);

  const handlePublish = useCallback(() => {
    if (token) {
      shareTriggeredRef.current = false;
      currentShareRequestIdRef.current = crypto.randomUUID();
      setAwaitingFreshProgress(true);
      setShareState({ status: 'uploading', shareUrl: '' });
    } else {
      setShareState({ status: 'idle' });
    }
  }, [token, setAwaitingFreshProgress, setShareState]);

  useEffect(() => {
    if (
      shareState.status !== 'uploading' ||
      shareTriggeredRef.current ||
      !token ||
      sharedUploadInFlight
    ) {
      return;
    }

    shareTriggeredRef.current = true;
    setAwaitingFreshProgress(true);
    const shareRequestId = currentShareRequestIdRef.current ?? crypto.randomUUID();
    currentShareRequestIdRef.current = shareRequestId;
    api.getChannel()?.emit(START_SHARE, { accessToken: token, shareRequestId });
    emitTelemetry('share-initiated', { isRepeatShare: isRepeatShareRef.current });
    isRepeatShareRef.current = false;
  }, [
    api,
    emitTelemetry,
    setAwaitingFreshProgress,
    shareState.status,
    sharedUploadInFlight,
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

    if (
      shareProgress.shareRequestId &&
      shareProgress.shareRequestId !== currentShareRequestIdRef.current
    ) {
      return;
    }

    if (
      (shareProgress.status === 'pending' || shareProgress.status === 'uploading') &&
      awaitingFreshProgress
    ) {
      setAwaitingFreshProgress(false);
    }

    if (
      awaitingFreshProgress &&
      (shareProgress.status === 'complete' || shareProgress.status === 'error')
    ) {
      return;
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

      if (shareUrl !== lastCompletedShareUrl) {
        setLastCompletedShareUrl(shareUrl);
        setLastCompletedGitInfo(gitInfo);
        emitTelemetry('share-upload-completed');
        api.addNotification({
          id: `${ADDON_ID}/share-published`,
          content: {
            headline: 'Storybook published!',
            subHeadline: shareUrl,
          },
          duration: 8_000,
          onClick: ({ onDismiss }: { onDismiss: () => void }) => {
            navigator.clipboard.writeText(shareUrl);
            onDismiss();
          },
        });
      }
      return;
    }

    if (shareProgress.status === 'error') {
      const errorMessage = shareProgress.error ?? '';
      const isAuthError = /\b(401|403|unauthorized|expired)\b/i.test(errorMessage);
      if (isAuthError) {
        updateToken(null);
        setShareState({ status: 'idle' });
      } else {
        setShareState({ status: 'error', reason: 'unknown', message: errorMessage || undefined });
      }
      emitTelemetry('share-failed');
    }
  }, [
    api,
    awaitingFreshProgress,
    currentShareUrl,
    emitTelemetry,
    gitInfo,
    lastCompletedShareUrl,
    setAwaitingFreshProgress,
    setLastCompletedShareUrl,
    setLastCompletedGitInfo,
    setShareState,
    shareProgress,
    updateToken,
  ]);

  switch (shareState.status) {
    case 'welcome':
      return <ShareSectionWelcome onPublish={handlePublish} />;
    case 'idle':
      return <ShareSectionIdle onSignIn={startSignIn} />;
    case 'uploading':
      return (
        <ShareSectionUploading
          shareUrl={shareState.shareUrl}
          progress={shareProgress?.progress}
          step={shareProgress?.status}
          onCopy={() => emitTelemetry('share-url-copied')}
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
            shareTriggeredRef.current = false;
            currentShareRequestIdRef.current = crypto.randomUUID();
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
