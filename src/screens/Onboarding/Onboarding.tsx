import React, { useEffect, useState } from "react";

import { useSignIn } from "../../utils/useSignIn";
import { SetSubdomain } from "./SetSubdomain";
import { SignIn } from "./SignIn";
import { Verify } from "./Verify";
import { Welcome } from "./Welcome";

interface OnboardingProps {
  setAccessToken: (token: string) => void;
}

type OnboardingScreen = "welcome" | "signin" | "subdomain" | "verify";

export const Onboarding = ({ setAccessToken }: OnboardingProps) => {
  const [screen, setScreen] = useState<OnboardingScreen>("welcome");

  const [isMounted, setMounted] = useState(true);
  useEffect(() => () => setMounted(false), []);

  const { onSignIn, userCode, verificationUrl } = useSignIn({
    isMounted,
    onSuccess: setAccessToken,
    onFailure: () => {},
  });

  switch (screen) {
    case "welcome":
      return <Welcome onNext={() => setScreen("signin")} />;

    case "signin":
      return (
        <SignIn
          onBack={() => setScreen("welcome")}
          onSignIn={() => onSignIn().then(() => setScreen("verify"))}
          onSignInWithSSO={() => setScreen("subdomain")}
        />
      );

    case "subdomain":
      return (
        <SetSubdomain
          onBack={() => setScreen("signin")}
          onSignIn={(subdomain: string) => onSignIn(subdomain).then(() => setScreen("verify"))}
        />
      );

    case "verify":
      return (
        <Verify
          onBack={() => setScreen("signin")}
          userCode={userCode}
          verificationUrl={verificationUrl}
        />
      );

    default:
      return null;
  }
};
