import { useCallback, useEffect, useReducer } from 'react';
import type { API } from 'storybook/manager-api';

import { GIT_INFO, SHARE_PROGRESS } from '../../constants';
import type { GitInfoPayload, ShareProgress } from '../../types';
import { checkOutdated } from '../../utils/checkOutdated';
import { useAccessToken } from '../../utils/graphQLClient';
import { useSessionState } from '../../utils/useSessionState';
import { useSharedState } from '../../utils/useSharedState';
import { setPresent } from './popoverPresence';
import { initialState, shareReducer } from './shareMachine';
import { SharePopupComplete } from './SharePopupComplete';
import { SharePopupError } from './SharePopupError';
import { SharePopupIdle } from './SharePopupIdle';
import { SharePopupSubdomain } from './SharePopupSubdomain';
import { SharePopupUploading } from './SharePopupUploading';
import { SharePopupWelcome } from './SharePopupWelcome';
import type { ShareReducerState, ShareState } from './types';
import { useShareAuth } from './useShareAuth';
import { useShareExecution } from './useShareExecution';

export const SharePopup = ({ api }: { api: API }) => {
  const [token] = useAccessToken();
  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [shareProgress] = useSharedState<ShareProgress>(SHARE_PROGRESS);

  const [persisted, setPersisted] = useSessionState<ShareReducerState>(
    'shareReducer',
    initialState
  );
  const [reducerState, dispatch] = useReducer(shareReducer, persisted);

  const [lastCompletedShareUrl, setLastCompletedShareUrl] = useSessionState<string | null>(
    'shareLastCompletedUrl',
    null
  );
  const [lastCompletedGitInfo, setLastCompletedGitInfo] = useSessionState<
    GitInfoPayload | undefined
  >('shareLastCompletedGitInfo', undefined);

  // Persist reducer state for cross-remount survival.
  useEffect(() => {
    setPersisted(reducerState);
  }, [reducerState, setPersisted]);

  useEffect(() => {
    setPresent(true);
    return () => setPresent(false);
  }, []);

  const setShareScreen = useCallback(
    (screen: ShareState) => dispatch({ type: 'SET_SCREEN', screen }),
    []
  );
  const { startSignIn, updateToken } = useShareAuth(setShareScreen);

  const { emitTelemetry, handleCancel, handlePublish, handlePublishAgain } = useShareExecution({
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
  });

  const screen = reducerState.screen;
  switch (screen.status) {
    case 'welcome':
      return <SharePopupWelcome onPublish={handlePublish} />;
    case 'idle':
      return (
        <SharePopupIdle
          onSignIn={() => startSignIn()}
          onSignInWithSSO={() => dispatch({ type: 'GO_SUBDOMAIN' })}
        />
      );
    case 'subdomain':
      return (
        <SharePopupSubdomain
          onSubmit={(subdomain) => startSignIn(subdomain)}
          onBack={() => dispatch({ type: 'BACK_TO_IDLE' })}
        />
      );
    case 'uploading':
      return (
        <SharePopupUploading
          shareUrl={screen.shareUrl}
          step={shareProgress?.status}
          onCopy={() => emitTelemetry('share-url-copied')}
          onCancel={handleCancel}
        />
      );
    case 'complete':
      return (
        <SharePopupComplete
          shareUrl={screen.shareUrl}
          publishedAt={screen.publishedAt}
          daysToExpire={screen.daysToExpire}
          isOutdated={checkOutdated(lastCompletedGitInfo, gitInfo)}
          onCopy={() => emitTelemetry('share-url-copied')}
          onPublishAgain={handlePublishAgain}
        />
      );
    case 'error':
      return (
        <SharePopupError
          reason={screen.reason}
          message={screen.message}
          onRetry={handlePublish}
        />
      );
    default:
      return null;
  }
};
