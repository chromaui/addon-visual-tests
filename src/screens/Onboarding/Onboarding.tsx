import React, { useEffect, useState } from "react";

import { Welcome } from "./Welcome";
import { SignIn } from "./SignIn";
import { SetSubdomain } from "./SetSubdomain";
import { Verify } from "./Verify";
import { useSignIn } from "../../utils/useSignIn";

interface OnboardingProps {
  setAccessToken: (token: string) => void;
}

export const Onboarding = ({ setAccessToken }: OnboardingProps) => {
  const [screen, setScreen] = useState("welcome");

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
  }
};
