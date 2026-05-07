import { useCallback, useRef } from 'react';

import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
import { initiateSignin, type TokenExchangeParameters } from '../../utils/requestAccessToken';
import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
import type { ShareState } from './types';

export function useShareAuth(setShareState: (s: ShareState) => void) {
  const [, updateToken] = useAccessToken();
  const paramsRef = useRef<TokenExchangeParameters | null>(null);
  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
  const closeDialogRef = useRef<() => void>();

  const handler = useCallback<DialogHandler>(
    async (event) => {
      const params = paramsRef.current;
      if (!params) return;

      const { redirectUri, state, codeVerifier, sessionId, subdomain } = params;
      const outcome = parseGrantPayload(event, state);

      if (outcome.kind === 'login' || outcome.kind === 'ignore') {
        return;
      }

      if (outcome.kind === 'error') {
        paramsRef.current = null;
        closeDialogRef.current?.();
        setShareState({ status: 'error', reason: 'unknown' });
        return;
      }

      paramsRef.current = null;

      try {
        const token = await exchangeOAuthCode(
          { codeVerifier, redirectUri, sessionId, subdomain },
          outcome.code
        );

        setAuthenticatedSession(token);
        updateToken(token.accessToken);
        closeDialogRef.current?.();
        setShareState({ status: 'uploading', shareUrl: '' });
      } catch {
        closeDialogRef.current?.();
        setShareState({ status: 'error', reason: 'unknown' });
      }
    },
    [setShareState, updateToken]
  );

  const [openDialog, closeDialog] = useChromaticDialog(handler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  const startSignIn = useCallback(
    async (subdomain?: string) => {
      try {
        const params = await initiateSignin(subdomain);
        paramsRef.current = params;
        const redirectOrigin = new URL(params.redirectUri).origin;
        openDialogRef.current?.(params.authorizationUrl, [redirectOrigin]);
      } catch {
        setShareState({ status: 'error', reason: 'unknown' });
      }
    },
    [setShareState]
  );

  return { startSignIn, updateToken };
}
