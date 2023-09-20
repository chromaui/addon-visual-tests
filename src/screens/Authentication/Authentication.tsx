import { useStorybookApi } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import React, { useCallback, useState } from "react";

import { ADDON_ID } from "../../constants";
import { initiateSignin, TokenExchangeParameters } from "../../utils/requestAccessToken";
import { SetSubdomain } from "./SetSubdomain";
import { SignIn } from "./SignIn";
import { Verify } from "./Verify";
import { Welcome } from "./Welcome";

interface AuthenticationProps {
  setAccessToken: (token: string) => void;
}

type AuthenticationScreen = "welcome" | "signin" | "subdomain" | "verify";

export const Authentication = ({ setAccessToken }: AuthenticationProps) => {
  const api = useStorybookApi();
  const [screen, setScreen] = useState<AuthenticationScreen>("welcome");
  const [exchangeParameters, setExchangeParameters] = useState<TokenExchangeParameters>();

  const initiateSignInAndMoveToVerify = useCallback(
    async (subdomain?: string) => {
      try {
        setExchangeParameters(await initiateSignin(subdomain));
        setScreen("verify");
      } catch (err: any) {
        // TODO API for this
        api.addNotification({
          id: `${ADDON_ID}/signin-error`,
          content: {
            headline: "Sign in Error",
            subHeadline: err.toString(),
          },
          icon: {
            name: "failed",
            color: color.negative,
          },
          // @ts-expect-error SB needs a proper API for no link
          link: undefined,
        });
      }
    },
    [api]
  );

  switch (screen) {
    case "welcome":
      return <Welcome onNext={() => setScreen("signin")} />;

    case "signin":
      return (
        <SignIn
          onBack={() => setScreen("welcome")}
          onSignIn={initiateSignInAndMoveToVerify}
          onSignInWithSSO={() => setScreen("subdomain")}
        />
      );

    case "subdomain":
      return (
        <SetSubdomain onBack={() => setScreen("signin")} onSignIn={initiateSignInAndMoveToVerify} />
      );

    case "verify":
      if (!exchangeParameters) {
        throw new Error("Expected to have a `exchangeParameters` if at `verify` step");
      }
      return (
        <Verify
          onBack={() => setScreen("signin")}
          setAccessToken={setAccessToken}
          exchangeParameters={exchangeParameters}
        />
      );

    default:
      return null;
  }
};
