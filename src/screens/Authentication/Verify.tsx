import React, { useRef } from 'react';
import { useClient } from 'urql';

import { Button } from '../../components/Button';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { graphql } from '../../gql';
import type { Project } from '../../gql/graphql';
import { getFetchOptions, setAuthenticatedSession } from '../../utils/graphQLClient';
import type { AuthSession, TokenExchangeParameters } from '../../utils/requestAccessToken';
import { useErrorNotification } from '../../utils/useErrorNotification';
import { useOAuthFlow } from '../../utils/useOAuthFlow';
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

  // Hold the auth session until the user finishes the create-project follow-up flow.
  const authSession = useRef<AuthSession>();

  const { begin } = useOAuthFlow({
    onAuthenticated: async (session, ctx) => {
      try {
        authSession.current = session;
        const fetchOptions = getFetchOptions(session.accessToken, session.sessionId);
        const { data } = await client.query(ProjectCountQuery, {}, { fetchOptions });

        if (!data?.viewer) throw new Error('Failed to fetch initial project list');

        if (data.viewer.projectCount > 0 || hasProjectId) {
          setAuthenticatedSession(session);
          setAccessToken(session.accessToken);
          ctx.closeDialog();
          return;
        }

        if (!data.viewer.accounts[0]) throw new Error('User has no accounts!');
        if (!data.viewer.accounts[0].newProjectUrl) {
          throw new Error('Unexpected missing project URL');
        }

        ctx.openDialog(data.viewer.accounts[0].newProjectUrl);
      } catch (err) {
        onError('Login Error', err);
      }
    },
    onError: (err) => onError('Login Error', err),
    onMessage: (event, ctx) => {
      if (event.message === 'createdProject') {
        if (!authSession.current) {
          onError('Unexpected missing auth session', new Error());
          return;
        }
        setAuthenticatedSession(authSession.current);
        setAccessToken(authSession.current.accessToken);
        setCreatedProjectId(`Project:${event.projectId}`);
        ctx.closeDialog();
      }
    },
  });

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
            onClick={() => begin(exchangeParameters)}
          >
            Go to Chromatic
          </Button>
        </Stack>
      </Container>
    </Screen>
  );
};
