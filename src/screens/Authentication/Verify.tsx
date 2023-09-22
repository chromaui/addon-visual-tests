import { styled } from "@storybook/theming";
import React, { useEffect } from "react";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { BackIcon } from "../../components/icons/BackIcon";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { useChromaticDialog } from "../../utils/useChromaticDialog";

const Digits = styled.ol(({ theme }) => ({
  display: "inline-flex",
  listStyle: "none",
  margin: 8,
  padding: 0,
  gap: 5,

  "li:not(:empty)": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px dashed ${theme.input.border}`,
    borderRadius: 4,
    width: 28,
    height: 32,
  },
}));

interface VerifyProps {
  onBack: () => void;
  userCode: string;
  verificationUrl: string;
}

export const Verify = ({ onBack, userCode, verificationUrl }: VerifyProps) => {
  const [openDialog, closeDialog] = useChromaticDialog((event) => {
    // If the user logs in as part of the grant process, don't close the dialog,
    // instead redirect us back to where we were trying to go.
    if (event.message === "login") {
      openDialog(verificationUrl);
    }
  });

  // Close the dialog on unmount, which happens automatically when poll for a token.
  // Later (https://linear.app/chromaui/issue/AP-3549/onboarding-flow-for-new-users-to-create-a-project)
  // we'll actually wait for the grant event and:
  //   - grab a token immediately
  //   - check if the user has projects, if not redirect to new project screen.
  useEffect(() => () => closeDialog(), [closeDialog]);

  return (
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
              // eslint-disable-next-line react/no-array-index-key
              <li key={`${index}-${char}`}>{char.replace(/[^A-Z0-9]/, "")}</li>
            ))}
          </Digits>
        </div>
        <Button secondary onClick={() => openDialog(verificationUrl)}>
          Go to Chromatic
        </Button>
      </Stack>
    </Container>
  );
};
