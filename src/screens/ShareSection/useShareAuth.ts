import { useCallback } from 'react';

import { initiateSignin } from '../../auth/requestAccessToken';
import { useOAuthFlow } from '../../auth/useOAuthFlow';
import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
import type { ShareState } from './types';

export function useShareAuth(setShareState: (s: ShareState) => void) {
  const [, updateToken] = useAccessToken();

  const { begin } = useOAuthFlow({
    onAuthenticated: (session, { closeDialog }) => {
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
