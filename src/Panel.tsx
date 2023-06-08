import React from "react";

import { Onboarding } from "./screens/Onboarding/Onboarding";

interface PanelProps {
  active: boolean;
}

export const Panel = (props: PanelProps) => {
  const handleSignIn = (subdomain: string) => {};

  return props.active ? <Onboarding onSignIn={handleSignIn} /> : <div hidden />;
};
