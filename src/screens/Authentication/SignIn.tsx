import React from 'react';

import { Button } from '../../components/Button';
import { ButtonStack } from '../../components/ButtonStack';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { LinkIcon } from '../../components/icons/LinkIcon';
import { VisualTestsIcon } from '../../components/icons/VisualTestsIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { AuthHeader } from './AuthHeader';

interface SignInProps {
  onBack?: () => void;
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

export const SignIn = ({ onBack, onSignIn, onSignInWithSSO }: SignInProps) => (
  <Screen footer={null} ignoreConfig>
    <AuthHeader onBack={onBack} />
    <Container>
      <Stack alignItems="center" textAlign="center">
        <div>
          <LinkIcon />
          <VisualTestsIcon />
          <Heading>Sign in to begin visual testing</Heading>
          <Text center muted>
            Pinpoint bugs instantly by connecting with cloud browsers that run visual tests in
            parallel.
          </Text>
        </div>
        <ButtonStack>
          <Button variant="solid" size="medium" onClick={() => onSignIn()}>
            Sign in with Chromatic
          </Button>
          <Button link onClick={() => onSignInWithSSO()}>
            Sign in with SSO
          </Button>
        </ButtonStack>
      </Stack>
    </Container>
  </Screen>
);
