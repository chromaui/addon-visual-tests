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
      const { authorizationUrl, redirectUri, state, clientId, codeVerifier, tokenEndpoint } =
        params ?? ({} as TokenExchangeParameters);
      const redirectOrigin = redirectUri ? new URL(redirectUri).origin : '';

      const outcome = parseGrantPayload(event, state);

      if (outcome.kind === 'login') {
        if (!params) return;
        openDialogRef.current?.(authorizationUrl, [redirectOrigin]);
        return;
      }
      if (outcome.kind === 'ignore') return;

      if (outcome.kind === 'code' && !params) {
        closeDialogRef.current?.();
        return;
      }

      if (outcome.kind === 'denied' || outcome.kind === 'error') {
        if (!params || !params.state) return;
        paramsRef.current = null;
        closeDialogRef.current?.();
        const reason = outcome.kind === 'denied' ? 'cancelled' : 'unknown';
        setShareState({ status: 'error', reason });
        return;
      }

      paramsRef.current = null;

      try {
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
