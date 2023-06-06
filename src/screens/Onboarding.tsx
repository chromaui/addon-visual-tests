import { styled, background, color } from "@storybook/theming";
import React, { SyntheticEvent, useState } from "react";

import { BackIcon } from "../components/BackIcon";
import { VisualTestsIcon } from "../components/VisualTestsIcon";
import { LinkIcon } from "../components/LinkIcon";
import { LinkButton } from "../components/LinkButton";

const Container = styled.div({
  background: background.app,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const Heading = styled.h1({
  margin: 0,
  marginTop: 8,
  fontSize: "1em",
  fontWeight: "bold",
});

const Text = styled.p({
  color: color.mediumdark,
  margin: 8,
  textAlign: "center",
});

const Button = styled.button({
  background: color.secondary,
  border: "none",
  borderRadius: 4,
  color: "white",
  margin: 8,
  padding: "9px 12px",
  cursor: "pointer",
  outline: "none",
  fontSize: "1em",
  fontWeight: 600,
});

const BackButton = styled(LinkButton)({
  position: "absolute",
  top: 10,
  left: 10,
});

const Digits = styled.ol({
  listStyle: "none",
  margin: 8,
  padding: 0,
  display: "flex",
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

interface WelcomeProps {
  onEnable: (e: SyntheticEvent) => void;
}

export const Welcome = ({ onEnable }: WelcomeProps) => (
  <Container>
    <VisualTestsIcon />
    <Heading>Visual tests</Heading>
    <Text>
      Catch bugs in UI appearance automatically. Compare image snapshots to
      detect visual changes.
    </Text>
    <Button onClick={onEnable}>Enable</Button>
  </Container>
);

interface SignInProps {
  onBack: (e: SyntheticEvent) => void;
  onSignIn: (e: SyntheticEvent) => void;
  onSignInWithSSO: (e: SyntheticEvent) => void;
}

export const SignIn = ({ onBack, onSignIn, onSignInWithSSO }: SignInProps) => (
  <Container>
    <BackButton onClick={onBack}>
      <BackIcon />
      Back
    </BackButton>
    <div>
      <LinkIcon />
      <VisualTestsIcon />
    </div>
    <Heading>Sign in to begin visual testing</Heading>
    <Text>
      Pinpoint bugs instantly by connecting with cloud browsers that run visual
      tests in parallel.
    </Text>
    <Button onClick={onSignIn}>Sign in with Chromatic</Button>
    <LinkButton onClick={onSignInWithSSO}>
      Sign into Chromatic with SSO
    </LinkButton>
  </Container>
);

interface VerifyProps {
  userCode: string;
  onBack: (e: SyntheticEvent) => void;
  onOpenChromatic: (e: SyntheticEvent) => void;
}

export const Verify = ({ userCode, onBack, onOpenChromatic }: VerifyProps) => (
  <Container>
    <BackButton onClick={onBack}>
      <BackIcon />
      Back
    </BackButton>
    <Heading>Verify your account</Heading>
    <Text>
      Enter this verification code on Chromatic to grant access to your
      published Storybooks.
    </Text>
    <Digits>
      {userCode.split("").map((char: string, index: number) => (
        <li key={index}>{char.replace(/[^A-Z0-9]/, "")}</li>
      ))}
    </Digits>
    <Button onClick={onOpenChromatic}>Go to Chromatic</Button>
  </Container>
);

export const Onboarding = () => {
  const [screen, setScreen] = useState("welcome");
  return {
    welcome: <Welcome onEnable={() => setScreen("signin")} />,
    signin: (
      <SignIn
        onBack={() => setScreen("welcome")}
        onSignIn={() => setScreen("verify")}
        onSignInWithSSO={() => setScreen("verify")}
      />
    ),
    verify: (
      <Verify
        userCode="123-123"
        onBack={() => setScreen("signin")}
        onOpenChromatic={() => setScreen("welcome")}
      />
    ),
  }[screen];
};
