import React, { useState } from "react";

import { Welcome } from "./Welcome";
import { SignIn } from "./SignIn";
import { SetSubdomain } from "./SetSubdomain";
import { Verify } from "./Verify";

interface OnboardingProps {
  onSignIn: (subdomain?: string) => void;
}

export const Onboarding = ({ onSignIn }: OnboardingProps) => {
  const [screen, setScreen] = useState("welcome");

  return {
    welcome: <Welcome onEnable={() => setScreen("signin")} />,
    signin: (
      <SignIn
        onBack={() => setScreen("welcome")}
        onSignIn={() => {
          onSignIn();
          setScreen("verify");
        }}
        onSignInWithSSO={() => setScreen("subdomain")}
      />
    ),
    subdomain: (
      <SetSubdomain
        onBack={() => setScreen("signin")}
        onSignIn={(subdomain: string) => {
          onSignIn(subdomain);
          setScreen("verify");
        }}
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
