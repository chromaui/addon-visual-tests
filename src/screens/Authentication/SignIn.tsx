import { ChevronLeftIcon } from "@storybook/icons";
import { styled, useTheme } from "@storybook/theming";
import React from "react";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { LinkIcon } from "../../components/icons/LinkIcon";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

interface SignInProps {
  onBack?: () => void;
  onSignIn: () => void;
  onSignInWithSSO: () => void;
}

const Label = styled.span(({ theme }) => ({
  color: theme.base === "light" ? theme.color.defaultText : theme.color.light,
}));

export const SignIn = ({ onBack, onSignIn, onSignInWithSSO }: SignInProps) => {
  const theme = useTheme();
  return (
    <Container>
      {onBack && (
        <BackButton onClick={onBack}>
          <ChevronLeftIcon color={theme.base === "light" ? "currentColor" : theme.color.medium} />
          <Label>Back</Label>
        </BackButton>
      )}
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
  );
};
