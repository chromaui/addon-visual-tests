import React from "react";

import { Onboarding } from "./screens/Onboarding";

interface PanelProps {
  active: boolean;
}

export const Panel = (props: PanelProps) => {
  return <Onboarding />;
};
