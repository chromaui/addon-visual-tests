import React, { useEffect, useState } from "react";

import { useSignIn } from "../../utils/useSignIn";
import { SetSubdomain } from "./SetSubdomain";
import { SignIn } from "./SignIn";
import { Verify } from "./Verify";
import { Welcome } from "./Welcome";

interface AuthenticationProps {
  setAccessToken: (token: string) => void;
  hasProjectId: boolean;
}

type AuthenticationScreen = "welcome" | "signin" | "subdomain" | "verify";

export const Authentication = ({ setAccessToken, hasProjectId }: AuthenticationProps) => {
  const [screen, setScreen] = useState<AuthenticationScreen>(hasProjectId ? "signin" : "welcome");

  const [isMounted, setMounted] = useState(true);
  useEffect(() => () => setMounted(false), []);

  const { onSignIn, userCode, verificationUrl } = useSignIn({
    isMounted,
    onSuccess: setAccessToken,
    onFailure: () => {},
  });

  switch (true) {
    case screen === "welcome" && !hasProjectId:
      return <Welcome onNext={() => setScreen("signin")} />;

    case screen === "signin" || (screen === "welcome" && hasProjectId):
      return (
        <SignIn
          onBack={hasProjectId ? undefined : () => setScreen("welcome")}
          onSignIn={() => onSignIn().then(() => setScreen("verify"))}
          onSignInWithSSO={() => setScreen("subdomain")}
        />
      );

    case screen === "subdomain":
      return (
        <SetSubdomain
          onBack={() => setScreen("signin")}
          onSignIn={(subdomain: string) => onSignIn(subdomain).then(() => setScreen("verify"))}
        />
      );

    case screen === "verify":
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
