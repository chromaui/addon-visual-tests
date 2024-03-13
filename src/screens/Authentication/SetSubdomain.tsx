import { Button } from "@storybook/components";
import { ChevronLeftIcon } from "@storybook/icons";
import { styled, useTheme } from "@storybook/theming";
import React, { useCallback, useState } from "react";

import { BackButton } from "../../components/BackButton";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { LinkIcon } from "../../components/icons/LinkIcon";
import { VisualTestsIcon } from "../../components/icons/VisualTestsIcon";
import { Screen } from "../../components/Screen";
import { SuffixInput } from "../../components/SuffixInput";
import { Text } from "../../components/Text";

const Form = styled.form({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 300,
  margin: 10,
});

const SubmitButton = styled(Button)({
  "&&": {
    fontSize: 13,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});

interface SetSubdomainProps {
  onBack: () => void;
  onSignIn: (subdomain: string) => void;
}

export const SetSubdomain = ({ onBack, onSignIn }: SetSubdomainProps) => {
  const theme = useTheme();
  const [subdomain, setSubdomain] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    setInputError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (subdomain) onSignIn(subdomain);
      else setInputError("Please enter a subdomain");
    },
    [subdomain, onSignIn]
  );

  return (
    <Screen footer={null} ignoreConfig>
      <Container>
        <BackButton onClick={onBack}>
          <ChevronLeftIcon color={theme.base === "light" ? "currentColor" : theme.color.medium} />
          Back
        </BackButton>
        <div>
          <LinkIcon />
          <VisualTestsIcon />
        </div>
        <Heading>Sign in with SSO</Heading>
        <Text muted>Enter your team&apos;s Chromatic URL.</Text>
        <Form onSubmit={handleSubmit}>
          <SuffixInput
            autoFocus
            icon="users"
            value={subdomain}
            placeholder="yourteam"
            suffix=".chromatic.com"
            onChange={handleChange}
            id="subdomain-input"
            stackLevel="top"
            error={inputError}
            errorTooltipPlacement="top"
          />
          <SubmitButton type="submit" variant="solid" size="medium">
            Continue
          </SubmitButton>
        </Form>
      </Container>
    </Screen>
  );
};
