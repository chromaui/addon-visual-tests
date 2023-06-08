import React from "react";

import { Onboarding } from "./screens/Onboarding/Onboarding";
import { SelectProject } from "./screens/SelectProject";

interface PanelProps {
  active: boolean;
}

export const Panel = (props: PanelProps) => {
  const [accessToken, setAccessToken] = React.useState(null);

  // Render a hidden element when the addon panel is not active.
  // Storybook's AddonPanel component does the same but it's not styleable so we don't use it.
  if (!props.active) return <div hidden />;

  // Render the onboarding flow if the user is not signed in.
  if (!accessToken) return <Onboarding setAccessToken={setAccessToken} />;

  return <SelectProject />;
};
