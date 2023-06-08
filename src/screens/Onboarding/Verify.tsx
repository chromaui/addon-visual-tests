import { styled } from "@storybook/theming";
import React from "react";

import { Container } from "../../components/Container";
import { BackButton } from "../../components/BackButton";
import { BackIcon } from "../../components/BackIcon";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { Stack } from "../../components/Stack";

const Digits = styled.ol({
  display: "inline-flex",
  listStyle: "none",
  margin: 8,
  padding: 0,
  gap: 5,

  "li:not(:empty)": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px dashed #ccc`,
    borderRadius: 4,
    width: 28,
    height: 32,
  },
});

interface VerifyProps {
  onBack: () => void;
  userCode: string;
  verificationUrl: string;
}

export const Verify = ({ onBack, userCode, verificationUrl }: VerifyProps) => (
  <Container>
    <BackButton onClick={onBack}>
      <BackIcon />
      Back
    </BackButton>
    <Stack>
      <div>
        <Heading>Verify your account</Heading>
        <Text>
          Enter this verification code on Chromatic to grant access to your published Storybooks.
        </Text>
        <Digits>
          {userCode?.split("").map((char: string, index: number) => (
            <li key={index}>{char.replace(/[^A-Z0-9]/, "")}</li>
          ))}
        </Digits>
      </div>
      <Button isLink appearance="secondary" href={verificationUrl} target="_blank">
        Go to Chromatic
      </Button>
    </Stack>
  </Container>
);
