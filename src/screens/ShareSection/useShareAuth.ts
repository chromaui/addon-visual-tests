import { useCallback, useEffect, useRef } from 'react';

import { useAccessToken } from '../../utils/graphQLClient';
import {
  fetchAccessToken,
  initiateSignin,
  type TokenExchangeParameters,
} from '../../utils/requestAccessToken';
import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
import type { ShareState } from './types';

export function useShareAuth(shareState: ShareState, setShareState: (s: ShareState) => void) {
  const [, updateToken] = useAccessToken();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exchangeParamsRef = useRef<TokenExchangeParameters | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    exchangeParamsRef.current = null;
  }, []);

  const handler = useCallback<DialogHandler>((event) => {
    if (event.message === 'grant' && !('denied' in event && event.denied)) {
      // The grant message confirms user authorized — polling will pick up the token
    }
  }, []);

  const [openDialog, closeDialog] = useChromaticDialog(handler);
  const openDialogRef = useRef(openDialog);
  const closeDialogRef = useRef(closeDialog);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  const startSignIn = useCallback(async () => {
    try {
      const params = await initiateSignin();
      exchangeParamsRef.current = params;

      setShareState({
        status: 'verifying',
        userCode: params.user_code,
        verificationUrl: params.verificationUrl,
        deviceCode: params.device_code,
        verifier: params.verifier,
        expires: params.expires,
        interval: params.interval,
      });

      pollingRef.current = setInterval(async () => {
        const currentParams = exchangeParamsRef.current;
        if (!currentParams) {
          clearPolling();
          return;
        }

        if (Date.now() >= currentParams.expires) {
          clearPolling();
          closeDialogRef.current();
          setShareState({ status: 'error', reason: 'expired' });
          return;
        }

        try {
          const token = await fetchAccessToken(currentParams);
          if (token) {
            clearPolling();
            updateToken(token);
            closeDialogRef.current();
            setShareState({ status: 'uploading', shareUrl: '' });
          }
        } catch {
          // authorization_pending — continue polling
        }
      }, params.interval);
    } catch {
      setShareState({ status: 'error', reason: 'unknown' });
    }
  }, [setShareState, updateToken, clearPolling]);

  const openVerificationDialog = useCallback(() => {
    if (shareState.status !== 'verifying') {
      return;
    }
    openDialogRef.current(shareState.verificationUrl);
  }, [shareState]);

  const reset = useCallback(() => {
    clearPolling();
    closeDialogRef.current();
    setShareState({ status: 'welcome' });
  }, [clearPolling, setShareState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return { startSignIn, reset, openVerificationDialog };
}
