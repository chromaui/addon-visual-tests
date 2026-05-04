import { useCallback, useRef } from 'react';

import { useAccessToken } from '../../utils/graphQLClient';
import { parseGrantPayload } from '../../utils/oauthGrant';
import {
  fetchAccessToken,
  initiateSignin,
  type TokenExchangeParameters,
} from '../../utils/requestAccessToken';
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
      const { authorizationUrl, redirectUri, state, clientId, codeVerifier, tokenEndpoint } =
        params;
      const redirectOrigin = new URL(redirectUri).origin;

      const outcome = parseGrantPayload(event, state);

      if (outcome.kind === 'login') {
        openDialogRef.current?.(authorizationUrl, [redirectOrigin]);
        return;
      }
      if (outcome.kind === 'ignore') return;

      try {
        if (outcome.kind === 'denied') throw new Error('cancelled');
        if (outcome.kind === 'error') throw new Error(outcome.message);

        const token = await fetchAccessToken({
          clientId,
          codeVerifier,
          redirectUri,
          tokenEndpoint,
          code: outcome.code,
        });
        if (!token) throw new Error('Failed to fetch an access token');

        updateToken(token);
        closeDialogRef.current?.();
        paramsRef.current = null;
        setShareState({ status: 'uploading', shareUrl: '' });
      } catch (err) {
        closeDialogRef.current?.();
        paramsRef.current = null;
        const reason = (err as Error)?.message === 'cancelled' ? 'cancelled' : 'unknown';
        setShareState({ status: 'error', reason });
      }
    },
    [setShareState, updateToken]
  );

  const [openDialog, closeDialog] = useChromaticDialog(handler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  const startSignIn = useCallback(async () => {
    try {
      const params = await initiateSignin();
      paramsRef.current = params;
      const redirectOrigin = new URL(params.redirectUri).origin;
      openDialogRef.current?.(params.authorizationUrl, [redirectOrigin]);
    } catch {
      setShareState({ status: 'error', reason: 'unknown' });
    }
  }, [setShareState]);

  const reset = useCallback(() => {
    closeDialogRef.current?.();
    paramsRef.current = null;
    setShareState({ status: 'welcome' });
  }, [setShareState]);

  return { startSignIn, reset };
}
