import { Button, Input } from "@storybook/design-system";
import { color, styled, typography } from "@storybook/theming";
import React, { ReactNode, useCallback, useState } from "react";

import { Container } from "../../components/Container";
import { BackButton } from "../../components/BackButton";
import { BackIcon } from "../../components/BackIcon";
import { LinkIcon } from "../../components/LinkIcon";
import { VisualTestsIcon } from "../../components/VisualTestsIcon";
import { Text } from "../../components/Text";
import { Heading } from "../../components/Heading";

const Form = styled.form({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: 300,
  margin: 10,

  input: {
    fontSize: `${typography.size.s2 - 1}px!important`,
  },
});

const SuffixWrapper = styled.div({
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  left: 40,
  right: 0,
  zIndex: 2,
  overflow: "hidden",
  height: 40,
  display: "flex",
  alignItems: "center",
  color: color.darker,

  span: {
    opacity: 0,
  },
});

const SuffixOverlay = ({
  value,
  placeholder,
  suffix,
}: {
  value: string;
  placeholder: string;
  suffix: ReactNode;
}) => (
  <SuffixWrapper>
    <span>{value || placeholder}</span>
    <b>{suffix}</b>
  </SuffixWrapper>
);

const SubmitButton = styled(Button)({
  "&&": {
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
  const [subdomain, setSubdomain] = useState("");
  const [inputError, setInputError] = useState(null);

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
    <Container>
      <BackButton onClick={onBack}>
        <BackIcon />
        Back
      </BackButton>
      <div>
        <LinkIcon />
        <VisualTestsIcon />
      </div>
      <Heading>Sign in with SSO</Heading>
      <Text>Enter your team&apos;s Chromatic URL.</Text>
      <Form onSubmit={handleSubmit}>
        <Input
          autoFocus
          label=""
          icon="users"
          value={subdomain}
          placeholder="yourteam"
          onChange={handleChange}
          id="subdomain-input"
          hideLabel
          stackLevel="top"
          error={inputError}
          errorTooltipPlacement="top"
        />
        <SuffixOverlay
          value={subdomain}
          placeholder="yourteam"
          suffix=".chromatic.com"
        />
        <SubmitButton type="submit" appearance="secondary">
          Continue
        </SubmitButton>
      </Form>
    </Container>
  );
};
