import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAuthState } from '../../AuthContext';
import { Project } from '../../gql/graphql';
import {
  createSignInDriver,
  type DriverSnapshot,
  type SignInDriver,
  type StartResult,
} from '../../utils/signInDriver';
import { useTelemetry } from '../../utils/TelemetryContext';
import { useErrorNotification } from '../../utils/useErrorNotification';
import { useSessionState } from '../../utils/useSessionState';
import { useUninstallAddon } from '../Uninstalled/UninstallContext';
import { SetSubdomain } from './SetSubdomain';
import { SignIn } from './SignIn';
import { Verify } from './Verify';
import { Welcome } from './Welcome';

interface AuthenticationProps {
  setAccessToken: (token: string | null) => void;
  setCreatedProjectId: (projectId: Project['id']) => void;
  hasProjectId: boolean;
}

type AuthenticationScreen = 'welcome' | 'signin' | 'subdomain' | 'verify';

export const Authentication = ({
  setAccessToken,
  setCreatedProjectId,
  hasProjectId,
}: AuthenticationProps) => {
  const [screen, setScreen] = useSessionState<AuthenticationScreen>(
    'authenticationScreen',
    hasProjectId ? 'signin' : 'welcome'
  );
  const [snapshot, setSnapshot] = useSessionState<DriverSnapshot | null>('signInSnapshot', null);
  const onError = useErrorNotification();
  const { uninstallAddon } = useUninstallAddon();
  const { setSubdomain } = useAuthState();

  const driverRef = useRef<SignInDriver | null>(null);
  if (driverRef.current === null) driverRef.current = createSignInDriver();

  const [verifyState, setVerifyState] = useState<StartResult | null>(null);

  useTelemetry('Authentication', screen.charAt(0).toUpperCase() + screen.slice(1));

  // On mount, attempt to resume from a stored snapshot when the flow matches
  // the current driver. Mismatched snapshots (e.g. flow flipped between
  // sessions) get dropped so the user falls back to the sign-in screen.
  useEffect(() => {
    const driver = driverRef.current!;
    if (screen !== 'verify') return;
    if (!snapshot) {
      setScreen('signin');
      return;
    }
    if (snapshot.flow !== driver.flow || !driver.resume) {
      setSnapshot(null);
      setScreen('signin');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await driver.resume!(snapshot, { onSnapshot: setSnapshot });
        if (!cancelled) setVerifyState(result);
      } catch (err) {
        if (!cancelled) {
          onError('Sign in Error', err);
          setSnapshot(null);
          setScreen('signin');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel the driver if we leave the verify screen or unmount.
  useEffect(() => {
    if (screen !== 'verify') {
      driverRef.current?.cancel();
      setVerifyState(null);
    }
  }, [screen]);

  useEffect(
    () => () => {
      driverRef.current?.cancel();
    },
    []
  );

  const initiateSignInAndMoveToVerify = useCallback(
    async (subdomain?: string) => {
      try {
        setSubdomain(subdomain ?? 'www');
        const result = await driverRef.current!.start({ subdomain, onSnapshot: setSnapshot });
        setVerifyState(result);
        setScreen('verify');
      } catch (err: any) {
        onError('Sign in Error', err);
      }
    },
    [onError, setScreen, setSnapshot, setSubdomain]
  );

  if (screen === 'welcome' && !hasProjectId) {
    return <Welcome onNext={() => setScreen('signin')} onUninstall={uninstallAddon} />;
  }

  if (screen === 'signin' || (screen === 'welcome' && hasProjectId)) {
    return (
      <SignIn
        {...(!hasProjectId ? { onBack: () => setScreen('welcome') } : {})}
        onSignIn={initiateSignInAndMoveToVerify}
        onSignInWithSSO={() => setScreen('subdomain')}
      />
    );
  }

  if (screen === 'subdomain') {
    return (
      <SetSubdomain onBack={() => setScreen('signin')} onSignIn={initiateSignInAndMoveToVerify} />
    );
  }

  if (screen === 'verify') {
    if (!verifyState) return null;
    return (
      <Verify
        onBack={() => setScreen('signin')}
        hasProjectId={hasProjectId}
        setAccessToken={setAccessToken}
        setCreatedProjectId={setCreatedProjectId}
        driver={driverRef.current!}
        affordance={verifyState.affordance}
        snapshot={snapshot}
        tokenPromise={verifyState.token}
      />
    );
  }

  return null;
};
