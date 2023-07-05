import React from "react";

import { PANEL_ID } from "./constants";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject, LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
}

export const Panel = ({ active }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const [projectId, updateProject, projectIdChanged, clearProjectIdChanged] = useProjectId();

  // Render a hidden element when the addon panel is not active.
  // Storybook's AddonPanel component does the same but it's not styleable so we don't use it.
  if (!active) return <div hidden key={PANEL_ID} />;

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) return <Authentication key={PANEL_ID} setAccessToken={setAccessToken} />;

  if (!projectId)
    return (
      <Provider key={PANEL_ID} value={client}>
        <LinkProject onUpdateProject={updateProject} />
      </Provider>
    );

  if (projectId && projectIdChanged) {
    return <LinkedProject projectId={projectId} goToNext={clearProjectIdChanged} />;
  }
  return (
    <Provider key={PANEL_ID} value={client}>
      <VisualTests setAccessToken={setAccessToken} />
    </Provider>
  );
};
