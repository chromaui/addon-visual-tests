import { useCallback } from 'react';

import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
import { initiateSignin } from '../../utils/requestAccessToken';
import { useOAuthFlow } from '../../utils/useOAuthFlow';
import type { ShareState } from './types';

export function useShareAuth(setShareState: (s: ShareState) => void) {
  const [, updateToken] = useAccessToken();

  const { begin } = useOAuthFlow({
    onAuthenticated: (session, { closeDialog }) => {
      // setAuthenticatedSession notifies authStore subscribers, including the
      // useAccessToken hook that drives the React mirror, so we don't need a
      // second updateToken call here.
      setAuthenticatedSession(session);
      closeDialog();
      setShareState({ status: 'uploading', shareUrl: '' });
    },
    onError: () => {
      setShareState({ status: 'error', reason: 'unknown' });
    },
  });

  const startSignIn = useCallback(
    async (subdomain?: string) => {
      try {
        const params = await initiateSignin(subdomain);
        begin(params);
      } catch {
        setShareState({ status: 'error', reason: 'unknown' });
      }
    },
    [begin, setShareState]
  );

  return { startSignIn, updateToken };
}
