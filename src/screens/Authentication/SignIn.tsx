import React from 'react';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';
import { ButtonStack } from '../../components/ButtonStack';
import { Container } from '../../components/Container';
import { Heading } from '../../components/Heading';
import { ChromaticIcon } from '../../components/icons/ChromaticIcon';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { AuthHeader } from './AuthHeader';

interface SignInProps {
  onBack?: () => void;
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

const Icon = styled(ChromaticIcon)({
  width: 40,
  height: 40,
  filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1))',
  marginBottom: 10,
});

export const SignIn = ({ onBack, onSignIn, onSignInWithSSO }: SignInProps) => (
  <Screen footer={null} ignoreConfig>
    <AuthHeader onBack={onBack} />
    <Container>
      <Stack>
        <div>
          <Icon />
          <Heading>Sign in to begin visual testing</Heading>
          <Text center muted>
            Pinpoint bugs instantly by connecting with cloud browsers that run visual tests in
            parallel.
          </Text>
        </div>
        <ButtonStack>
          <Button ariaLabel={false} variant="solid" size="medium" onClick={() => onSignIn()}>
            Sign in with Chromatic
          </Button>
          <Button ariaLabel={false} link onClick={() => onSignInWithSSO()}>
            Sign in with SSO
          </Button>
        </ButtonStack>
      </Stack>
    </Container>
  </Screen>
);
