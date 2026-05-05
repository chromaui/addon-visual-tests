import { type Dispatch, useCallback, useEffect, useRef } from 'react';

import type { AuthCodeDriver } from '../../utils/authCodeDriver';
import { BetaUserDeniedError } from '../../utils/deviceCodeDriver';
import { useAccessToken } from '../../utils/graphQLClient';
import {
  createSignInDriver,
  type DriverAction,
  type DriverSnapshot,
  type SignInDriver,
} from '../../utils/signInDriver';
import { useChromaticDialog } from '../../utils/useChromaticDialog';
import { useSessionState } from '../../utils/useSessionState';
import type { ShareAction } from './types';

const errorReason = (err: unknown): 'cancelled' | 'expired' | 'unknown' => {
  if (err instanceof BetaUserDeniedError) return 'expired';
  const e = err as { name?: string; message?: string } | null;
  if (!e) return 'unknown';
  if (e.name === 'AbortError') return 'cancelled';
  if (typeof e.message === 'string') {
    const m = e.message.toLowerCase();
    if (m.includes('cancel')) return 'cancelled';
    if (m.includes('expired')) return 'expired';
  }
  return 'unknown';
};

export function useShareAuth(dispatch: Dispatch<ShareAction>) {
  const [, updateToken] = useAccessToken();

  const driverRef = useRef<SignInDriver | null>(null);
  if (driverRef.current === null) {
    driverRef.current = createSignInDriver();
  }
  const driver = driverRef.current;

  const startedRef = useRef(false);
  const [snapshot, setSnapshot] = useSessionState<DriverSnapshot | null>(
    'shareSignInSnapshot',
    null
  );
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const driverDispatch = useCallback((action: DriverAction) => dispatch(action), [dispatch]);

  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
  const closeDialogRef = useRef<() => void>();

  const dialogHandler = useCallback(async (event: unknown) => {
    const d = driverRef.current as AuthCodeDriver | null;
    if (!d || d.flow !== 'authorization-code') return;
    const outcome = await d.handleDialogEvent(
      event as Parameters<AuthCodeDriver['handleDialogEvent']>[0]
    );
    if (outcome.kind === 'code' || outcome.kind === 'error') {
      closeDialogRef.current?.();
    }
  }, []);

  const [openDialog, closeDialog] = useChromaticDialog(dialogHandler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  const finalizeToken = useCallback(
    async (tokenPromise: Promise<string>) => {
      try {
        const token = await tokenPromise;
        dispatch({ type: 'START_UPLOAD', newRequestId: crypto.randomUUID() });
        updateToken(token);
        setSnapshot(null);
        closeDialogRef.current?.();
      } catch (err) {
        dispatch({ type: 'VERIFICATION_FAILED', reason: errorReason(err) });
        setSnapshot(null);
        closeDialogRef.current?.();
      } finally {
        startedRef.current = false;
      }
    },
    [dispatch, setSnapshot, updateToken]
  );

  // On mount: resume from snapshot when flow matches.
  useEffect(() => {
    const snap = snapshotRef.current;
    if (!snap) return;
    if (snap.flow !== driver.flow) {
      setSnapshot(null);
      return;
    }
    if (!driver.resume) return;
    if (startedRef.current) return;
    startedRef.current = true;

    driver
      .resume(snap, { dispatch: driverDispatch, onSnapshot: setSnapshot })
      .then((result) => finalizeToken(result.token))
      .catch((err) => {
        dispatch({ type: 'VERIFICATION_FAILED', reason: errorReason(err) });
        setSnapshot(null);
        startedRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      driver.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSignIn = useCallback(
    async (subdomain?: string) => {
      if (startedRef.current) return;
      startedRef.current = true;

      try {
        const result = await driver.start({
          subdomain,
          dispatch: driverDispatch,
          onSnapshot: (s) => {
            setSnapshot(s);
            if (s.flow === 'authorization-code') {
              const redirectOrigin = new URL(s.params.redirectUri).origin;
              openDialogRef.current?.(s.params.authorizationUrl, [redirectOrigin]);
            }
          },
        });
        // Token resolution happens later — don't block startSignIn on it.
        finalizeToken(result.token);
      } catch (err) {
        dispatch({ type: 'VERIFICATION_FAILED', reason: errorReason(err) });
        setSnapshot(null);
        startedRef.current = false;
      }
    },
    [driver, driverDispatch, dispatch, finalizeToken, setSnapshot]
  );

  return { startSignIn, updateToken };
}
