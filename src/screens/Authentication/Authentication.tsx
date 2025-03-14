import React, { useCallback } from "react";

import { useAuthState } from "../../AuthContext";
import { Project } from "../../gql/graphql";
import { initiateSignin, TokenExchangeParameters } from "../../utils/requestAccessToken";
import { useTelemetry } from "../../utils/TelemetryContext";
import { useErrorNotification } from "../../utils/useErrorNotification";
import { useSessionState } from "../../utils/useSessionState";
import { useUninstallAddon } from "../Uninstalled/UninstallContext";
import { SetSubdomain } from "./SetSubdomain";
import { SignIn } from "./SignIn";
import { Verify } from "./Verify";
import { Welcome } from "./Welcome";

interface AuthenticationProps {
  setAccessToken: (token: string | null) => void;
  setCreatedProjectId: (projectId: Project["id"]) => void;
  hasProjectId: boolean;
}

type AuthenticationScreen = "welcome" | "signin" | "subdomain" | "verify";

export const Authentication = ({
  setAccessToken,
  setCreatedProjectId,
  hasProjectId,
}: AuthenticationProps) => {
  const [screen, setScreen] = useSessionState<AuthenticationScreen>(
    "authenticationScreen",
    hasProjectId ? "signin" : "welcome"
  );
  const [exchangeParameters, setExchangeParameters] =
    useSessionState<TokenExchangeParameters>("exchangeParameters");
  const onError = useErrorNotification();
  const { uninstallAddon } = useUninstallAddon();
  const { setSubdomain } = useAuthState();

  useTelemetry("Authentication", screen.charAt(0).toUpperCase() + screen.slice(1));

  const initiateSignInAndMoveToVerify = useCallback(
    async (subdomain?: string) => {
      try {
        setSubdomain(subdomain ?? "www");
        setExchangeParameters(await initiateSignin(subdomain));
        setScreen("verify");
      } catch (err: any) {
        onError("Sign in Error", err);
      }
    },
    [onError, setExchangeParameters, setScreen, setSubdomain]
  );

  if (screen === "welcome" && !hasProjectId) {
    return <Welcome onNext={() => setScreen("signin")} onUninstall={uninstallAddon} />;
  }

  if (screen === "signin" || (screen === "welcome" && hasProjectId)) {
    return (
      <SignIn
        {...(!hasProjectId ? { onBack: () => setScreen("welcome") } : {})}
        onSignIn={initiateSignInAndMoveToVerify}
        onSignInWithSSO={() => setScreen("subdomain")}
      />
    );
  }

  if (screen === "subdomain") {
    return (
      <SetSubdomain onBack={() => setScreen("signin")} onSignIn={initiateSignInAndMoveToVerify} />
    );
  }

  if (screen === "verify") {
    if (!exchangeParameters) {
      throw new Error("Expected to have a `exchangeParameters` if at `verify` step");
    }
    return (
      <Verify
        onBack={() => setScreen("signin")}
        hasProjectId={hasProjectId}
        setAccessToken={setAccessToken}
        setCreatedProjectId={setCreatedProjectId}
        exchangeParameters={exchangeParameters}
      />
    );
  }

  return null;
};
