import { Link } from "@storybook/design-system";
import { color, styled } from "@storybook/theming";
import React from "react";

import { BackButton } from "../../components/BackButton";
import { BackIcon } from "../../components/BackIcon";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { LinkIcon } from "../../components/LinkIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { VisualTestsIcon } from "../../components/VisualTestsIcon";

interface SignInProps {
  onBack: () => void;
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

const OpaqueLink = styled(Link)({
  "&&": {
    opacity: 0.7,
    fontSize: "12px",
    lineHeight: "18px",
    color: color.darker,
  },
});

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
      <Button appearance="secondary" onClick={() => onSignIn()}>
        Sign in with Chromatic
      </Button>
      <OpaqueLink isButton onClick={() => onSignInWithSSO()}>
        Sign into Chromatic with SSO
      </OpaqueLink>
    </Stack>
  </Container>
);
