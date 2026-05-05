import React, { useCallback, useRef } from 'react';
import { useClient } from 'urql';

import { Button } from '../../components/Button';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { graphql } from '../../gql';
import type { Project } from '../../gql/graphql';
import { getFetchOptions } from '../../utils/graphQLClient';
import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
import type { TokenExchangeParameters } from '../../utils/requestAccessToken';
import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
import { useErrorNotification } from '../../utils/useErrorNotification';
import { AuthHeader } from './AuthHeader';

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
  exchangeParameters: TokenExchangeParameters;
}

export const Verify = ({
  onBack,
  hasProjectId,
  setAccessToken,
  setCreatedProjectId,
  exchangeParameters,
}: VerifyProps) => {
  const client = useClient();
  const onError = useErrorNotification();

  const { authorizationUrl, state, clientId, codeVerifier, redirectUri, tokenEndpoint } =
    exchangeParameters;
  const redirectOrigin = new URL(redirectUri).origin;

  // Store the access token until we are ready to pass it to `setAccessToken` (at which point
  // the Panel will close the Authentication screen)
  const accessToken = useRef<string>();

  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
  const closeDialogRef = useRef<() => void>();
  const handler = useCallback<DialogHandler>(
    async (event) => {
      // If the user logs in as part of the grant process, don't close the dialog,
      // instead redirect us back to where we were trying to go.
      if (event.message === 'login') {
        openDialogRef.current?.(authorizationUrl, [redirectOrigin]);
      }

      if (event.message === 'grant') {
        try {
          const outcome = parseGrantPayload(event, state);
          if (outcome.kind === 'ignore') return;
          if (outcome.kind === 'error') throw new Error(outcome.message);
          if (outcome.kind === 'login') return;

          const token = await exchangeOAuthCode(
            { clientId, codeVerifier, redirectUri, tokenEndpoint },
            outcome.code
          );
          accessToken.current = token;

          // Override token for this query but don't store it yet until they've created a project
          const fetchOptions = getFetchOptions(token);
          const { data } = await client.query(ProjectCountQuery, {}, { fetchOptions });

          if (!data?.viewer) throw new Error('Failed to fetch initial project list');

          // The user has projects to choose from (or the project is already selected),
          // so send them to pick one
          if (data.viewer.projectCount > 0 || hasProjectId) {
            setAccessToken(accessToken.current);
            closeDialogRef.current?.();
          } else {
            // The user has no projects, so we need to get them to create one, then close the dialog
            if (!data.viewer.accounts[0]) throw new Error('User has no accounts!');
            if (!data.viewer.accounts[0].newProjectUrl) {
              throw new Error('Unexpected missing project URL');
            }

            openDialogRef.current?.(data.viewer.accounts[0].newProjectUrl);
          }
        } catch (err) {
          onError('Login Error', err);
        }
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
    [
      authorizationUrl,
      redirectOrigin,
      state,
      clientId,
      codeVerifier,
      redirectUri,
      tokenEndpoint,
      client,
      hasProjectId,
      setAccessToken,
      onError,
      setCreatedProjectId,
    ]
  );
  const [openDialog, closeDialog] = useChromaticDialog(handler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  return (
    <Screen footer={null} ignoreConfig>
      <AuthHeader onBack={onBack} />
      <Container>
        <Stack>
          <div>
            <Heading>Verify your account</Heading>
            <div>
              <Text center muted>
                Continue in Chromatic to approve access to your published Storybooks.
              </Text>
            </div>
          </div>
          <Button
            ariaLabel={false}
            variant="solid"
            size="medium"
            onClick={() => openDialog(authorizationUrl, [redirectOrigin])}
          >
            Go to Chromatic
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};
