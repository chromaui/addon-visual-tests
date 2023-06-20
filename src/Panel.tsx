import React from "react";

import { Authentication } from "./screens/Authentication/Authentication";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";

interface PanelProps {
  active: boolean;
}

export const Panel = ({ active }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();

  // Render a hidden element when the addon panel is not active.
  // Storybook's AddonPanel component does the same but it's not styleable so we don't use it.
  if (!active) return <div hidden />;

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) return <Authentication setAccessToken={setAccessToken} />;

  return (
    <Provider value={client}>
      <LinkProject />
    </Provider>
  );
};
