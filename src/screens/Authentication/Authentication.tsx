import React, { useCallback } from 'react';

import { initiateSignin, TokenExchangeParameters } from '../../auth/requestAccessToken';
import { useAuthState } from '../../AuthContext';
import { Project } from '../../gql/graphql';
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
  const [exchangeParameters, setExchangeParameters] =
    useSessionState<TokenExchangeParameters>('exchangeParameters');
  const onError = useErrorNotification();
  const { uninstallAddon } = useUninstallAddon();
  const { setSubdomain } = useAuthState();

  const renderedScreen = screen === 'welcome' && hasProjectId ? 'signin' : screen;
  const trackEvent = useTelemetry(
    'Authentication',
    renderedScreen.charAt(0).toUpperCase() + renderedScreen.slice(1)
  );

  const initiateSignInAndMoveToVerify = useCallback(
    async (subdomain?: string) => {
      try {
        setSubdomain(subdomain ?? 'www');
        setExchangeParameters(await initiateSignin(subdomain));
        setScreen('verify');
      } catch (err: any) {
        onError('Sign in Error', err);
      }
    },
    [onError, setExchangeParameters, setScreen, setSubdomain]
  );

  if (screen === 'welcome' && !hasProjectId) {
    return (
      <Welcome
        onNext={() => {
          trackEvent('continue');
          setScreen('signin');
        }}
        onUninstall={() => {
          trackEvent('uninstallAddon');
          uninstallAddon();
        }}
      />
    );
  }

  if (screen === 'signin' || (screen === 'welcome' && hasProjectId)) {
    return (
      <SignIn
        {...(!hasProjectId
          ? {
              onBack: () => {
                trackEvent('goBack');
                setScreen('welcome');
              },
            }
          : {})}
        onSignIn={() => {
          trackEvent('signIn');
          initiateSignInAndMoveToVerify();
        }}
        onSignInWithSSO={() => {
          trackEvent('signInWithSSO');
          setScreen('subdomain');
        }}
      />
    );
  }

  if (screen === 'subdomain') {
    return (
      <SetSubdomain
        onBack={() => {
          trackEvent('goBack');
          setScreen('signin');
        }}
        onSignIn={(subdomain) => {
          trackEvent('submitSubdomain');
          initiateSignInAndMoveToVerify(subdomain);
        }}
      />
    );
  }

  if (screen === 'verify') {
    if (!exchangeParameters) {
      throw new Error('Expected to have a `exchangeParameters` if at `verify` step');
    }
    return (
      <Verify
        onBack={() => {
          trackEvent('goBack');
          setScreen('signin');
        }}
        hasProjectId={hasProjectId}
        setAccessToken={setAccessToken}
        setCreatedProjectId={setCreatedProjectId}
        exchangeParameters={exchangeParameters}
      />
    );
  }

  return null;
};
