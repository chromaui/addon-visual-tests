import React, { useEffect, useState } from "react";

import { useSignIn } from "../../utils/useSignIn";
import { SetSubdomain } from "./SetSubdomain";
import { SignIn } from "./SignIn";
import { Verify } from "./Verify";
import { Welcome } from "./Welcome";

interface AuthenticationProps {
  setAccessToken: (token: string | null) => void;
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

  if (screen === "welcome" && !hasProjectId) {
    return <Welcome onNext={() => setScreen("signin")} />;
  }

  if (screen === "signin" || (screen === "welcome" && hasProjectId)) {
    return (
      <SignIn
        {...(!hasProjectId ? { onBack: () => setScreen("welcome") } : {})}
        onSignIn={() => onSignIn().then(() => setScreen("verify"))}
        onSignInWithSSO={() => setScreen("subdomain")}
      />
    );
  }

  if (screen === "subdomain") {
    return (
      <SetSubdomain
        onBack={() => setScreen("signin")}
        onSignIn={(subdomain: string) => onSignIn(subdomain).then(() => setScreen("verify"))}
      />
    );
  }

  if (screen === "verify") {
    if (!userCode || !verificationUrl) {
      throw new Error("Expected to have a `userCode` and `verificationUrl` if at `verify` step");
    }
    return (
      <Verify
        onBack={() => setScreen("signin")}
        userCode={userCode}
        verificationUrl={verificationUrl}
      />
    );
  }

  return null;
};
