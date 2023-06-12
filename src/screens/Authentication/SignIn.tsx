import React from "react";

import { Container } from "../../components/Container";
import { BackButton } from "../../components/BackButton";
import { BackIcon } from "../../components/icons/BackIcon";
import { LinkIcon } from "../../components/icons/LinkIcon";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { Stack } from "../../components/Stack";

interface SignInProps {
  onBack: () => void;
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

export const SignIn = ({ onBack, onSignIn, onSignInWithSSO }: SignInProps) => (
  <Container>
    <BackButton onClick={onBack}>
      <BackIcon />
      Back
    </BackButton>
    <Stack alignItems="center" textAlign="center">
      <div>
        <LinkIcon />
        <VisualTestsIcon />
        <Heading>Sign in to begin visual testing</Heading>
        <Text>
          Pinpoint bugs instantly by connecting with cloud browsers that run visual tests in
          parallel.
        </Text>
      </div>
      <Button secondary onClick={() => onSignIn()}>
        Sign in with Chromatic
      </Button>
      <Button link onClick={() => onSignInWithSSO()}>
        Sign into Chromatic with SSO
      </Button>
    </Stack>
  </Container>
);
