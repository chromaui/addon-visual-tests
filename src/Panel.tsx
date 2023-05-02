import React from "react";
import { useAddonState } from "@storybook/manager-api";
import { AddonPanel } from "@storybook/components";
import { ADDON_ID } from "./constants";

interface PanelProps {
  active: boolean;
}

export const Panel: React.FC<PanelProps> = (props) => {
  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [{ build }] = useAddonState<{ build: { url?: string } }>(ADDON_ID, {});

  return (
    <AddonPanel {...props}>
      {build ? <a href={build.url}>Build Running</a> : <p>No build yet</p>}
    </AddonPanel>
  );
};
