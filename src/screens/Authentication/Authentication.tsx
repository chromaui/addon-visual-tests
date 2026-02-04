import React, { useCallback } from 'react';

import { Project } from '../../gql/graphql';
import { useAuth } from '../../utils/graphQLClient';
import { initiateSignin } from '../../utils/requestAccessToken';
import { useTelemetry } from '../../utils/TelemetryContext';
import { useErrorNotification } from '../../utils/useErrorNotification';
import { useUninstallAddon } from '../Uninstalled/UninstallContext';
import { SetSubdomain } from './SetSubdomain';
import { SignIn } from './SignIn';
import { Verify } from './Verify';
import { Welcome } from './Welcome';

interface AuthenticationProps {
  setCreatedProjectId: (projectId: Project['id']) => void;
  hasProjectId: boolean;
}

export const Authentication = ({ setCreatedProjectId, hasProjectId }: AuthenticationProps) => {
  const onError = useErrorNotification();
  const { uninstallAddon } = useUninstallAddon();
  const [auth, setAuth] = useAuth();

  const screen = auth.screen;

  useTelemetry('Authentication', screen.charAt(0).toUpperCase() + screen.slice(1));

  const initiateSignInAndMoveToVerify = useCallback(
    async (subdomain?: string) => {
      try {
        const exchangeParameters = await initiateSignin(subdomain);
        setAuth((s) => ({
          ...s,
          subdomain: subdomain ?? 'www',
          exchangeParameters,
          screen: 'verify',
        }));
      } catch (err: any) {
        onError('Sign in Error', err);
      }
    },
    [onError, setAuth]
  );

  if (screen === 'welcome' && !hasProjectId) {
    return (
      <Welcome
        onNext={() => setAuth((s) => ({ ...s, screen: 'signin' }))}
        onUninstall={uninstallAddon}
      />
    );
  }

  if (screen === 'signin' || (screen === 'welcome' && hasProjectId)) {
    return (
      <SignIn
        {...(!hasProjectId ? { onBack: () => setAuth((s) => ({ ...s, screen: 'welcome' })) } : {})}
        onSignIn={initiateSignInAndMoveToVerify}
        onSignInWithSSO={() => setAuth((s) => ({ ...s, screen: 'subdomain' }))}
      />
    );
  }

  if (screen === 'subdomain') {
    return (
      <SetSubdomain
        onBack={() => setAuth((s) => ({ ...s, screen: 'signin' }))}
        onSignIn={initiateSignInAndMoveToVerify}
      />
    );
  }

  if (screen === 'verify') {
    if (!auth.exchangeParameters) {
      throw new Error('Expected to have a `exchangeParameters` if at `verify` step');
    }
    return (
      <Verify
        onBack={() => setAuth((s) => ({ ...s, screen: 'signin' }))}
        setAuth={setAuth}
        hasProjectId={hasProjectId}
        setCreatedProjectId={setCreatedProjectId}
        exchangeParameters={auth.exchangeParameters}
      />
    );
  }

  return null;
};
