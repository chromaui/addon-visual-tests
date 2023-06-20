import { styled } from "@storybook/theming";
import React from "react";

import { BackButton } from "../../components/BackButton";
import { BackIcon } from "../../components/BackIcon";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Heading } from "../../components/Heading";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

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

export const Verify = ({ onBack, userCode, verificationUrl }: VerifyProps) => {
  const dialog = React.useRef<Window>();

  // Close the dialog window when the screen gets unmounted.
  React.useEffect(() => () => dialog.current?.close(), []);

  const openChromatic = () => {
    const width = 800;
    const height = 800;
    const usePopup = window.innerWidth > width && window.innerHeight > height;

    if (usePopup) {
      const left = (window.innerWidth - width) / 2 + window.screenLeft;
      const top = (window.innerHeight - height) / 2 + window.screenTop;
      const options = `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`;
      dialog.current = window.open(verificationUrl, "oauth-dialog", options);
      if (window.focus) dialog.current.focus();
    } else {
      dialog.current = window.open(verificationUrl, "_blank");
    }
  };

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
        <Button appearance="secondary" onClick={openChromatic}>
          Go to Chromatic
        </Button>
      </Stack>
    </Container>
  );
};
