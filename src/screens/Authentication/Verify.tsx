import React, { useCallback, useEffect, useRef } from 'react';
import { styled } from 'storybook/theming';
import { useClient } from 'urql';

import { Button } from '../../components/Button';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { graphql } from '../../gql';
import type { Project } from '../../gql/graphql';
import type { AuthCodeDriver } from '../../utils/authCodeDriver';
import { getFetchOptions } from '../../utils/graphQLClient';
import type { DriverSnapshot, SignInAffordance, SignInDriver } from '../../utils/signInDriver';
import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
import { useErrorNotification } from '../../utils/useErrorNotification';
import { AuthHeader } from './AuthHeader';

const Digits = styled.ol(({ theme }) => ({
  display: 'inline-flex',
  listStyle: 'none',
  marginTop: 15,
  marginBottom: 5,
  padding: 0,
  gap: 5,

  'li:not(:empty)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px dashed ${theme.input.border}`,
    borderRadius: 4,
    width: 28,
    height: 32,
  },
}));

const ProjectCountQuery = graphql(/* GraphQL */ `
  query VisualTestsProjectCountQuery {
    viewer {
      projectCount
      accounts {
        newProjectUrl
      }
    }
  }
`);

interface VerifyProps {
  onBack: () => void;
  hasProjectId: boolean;
  setAccessToken: (token: string) => void;
  setCreatedProjectId: (projectId: Project['id']) => void;
  driver: SignInDriver;
  affordance?: SignInAffordance;
  snapshot: DriverSnapshot | null;
  tokenPromise: Promise<string>;
}

export const Verify = ({
  onBack,
  hasProjectId,
  setAccessToken,
  setCreatedProjectId,
  driver,
  affordance,
  snapshot,
  tokenPromise,
}: VerifyProps) => {
  const client = useClient();
  const onError = useErrorNotification();

  const authCodeParams =
    snapshot && snapshot.flow === 'authorization-code' ? snapshot.params : null;
  const authorizationUrl = authCodeParams?.authorizationUrl;
  const redirectOrigin = authCodeParams ? new URL(authCodeParams.redirectUri).origin : null;

  const accessToken = useRef<string>();
  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
  const closeDialogRef = useRef<() => void>();

  const handler = useCallback<DialogHandler>(
    async (event) => {
      // Auth-code path: forward dialog events to the driver. The driver parses
      // the grant payload and resolves/rejects its internal token promise; the
      // useEffect below awaits that promise to complete the sign-in.
      if (event.message === 'login' && authorizationUrl && redirectOrigin) {
        openDialogRef.current?.(authorizationUrl, [redirectOrigin]);
        return;
      }
      if (event.message === 'grant') {
        await (driver as AuthCodeDriver).handleDialogEvent?.(event);
        return;
      }
      if (event.message === 'createdProject') {
        if (!accessToken.current) {
          onError('Unexpected missing access token', new Error());
        } else {
          setAccessToken(accessToken.current);
          setCreatedProjectId(`Project:${event.projectId}`);
          closeDialogRef.current?.();
        }
      }
    },
    [authorizationUrl, redirectOrigin, driver, onError, setAccessToken, setCreatedProjectId]
  );
  const [openDialog, closeDialog] = useChromaticDialog(handler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await tokenPromise;
        if (cancelled) return;
        accessToken.current = token;

        const fetchOptions = getFetchOptions(token);
        const { data } = await client.query(ProjectCountQuery, {}, { fetchOptions });
        if (cancelled) return;

        if (!data?.viewer) throw new Error('Failed to fetch initial project list');

        if (data.viewer.projectCount > 0 || hasProjectId) {
          setAccessToken(token);
          closeDialogRef.current?.();
        } else {
          if (!data.viewer.accounts[0]) throw new Error('User has no accounts!');
          if (!data.viewer.accounts[0].newProjectUrl) {
            throw new Error('Unexpected missing project URL');
          }
          openDialogRef.current?.(data.viewer.accounts[0].newProjectUrl);
        }
      } catch (err) {
        if (!cancelled) onError('Login Error', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenPromise, client, hasProjectId, setAccessToken, onError]);

  const handleGoToChromatic = () => {
    if (affordance) {
      window.open(affordance.verificationUrl, '_blank');
    } else if (authorizationUrl && redirectOrigin) {
      openDialog(authorizationUrl, [redirectOrigin]);
    }
  };

  return (
    <Screen footer={null} ignoreConfig>
      <AuthHeader onBack={onBack} />
      <Container>
        <Stack>
          <div>
            <Heading>Verify your account</Heading>
            <div>
              <Text center muted>
                {affordance
                  ? 'Check this verification code on Chromatic to grant access to your published Storybooks.'
                  : 'Continue in Chromatic to approve access to your published Storybooks.'}
              </Text>
            </div>
            {affordance ? (
              <Digits>
                {affordance.userCode.split('').map((char: string, index: number) => (
                  <li key={`${index}-${char}`}>{char.replace(/[^A-Z0-9]/, '')}</li>
                ))}
              </Digits>
            ) : null}
          </div>
          <Button ariaLabel={false} variant="solid" size="medium" onClick={handleGoToChromatic}>
            Go to Chromatic
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};
