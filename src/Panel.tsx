import { useAddonState, useChannel, useStorybookState } from "@storybook/manager-api";
import React, { useCallback } from "react";

import { ADDON_ID, PANEL_ID, START_BUILD } from "./constants";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { AddonState } from "./types";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
}

const { GIT_BRANCH } = process.env;

export const Panel = ({ active }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();

  const [state, setAddonState] = useAddonState<AddonState>(ADDON_ID, { isOutdated: true });
  const { storyId } = useStorybookState();

  const setIsOutdated = useCallback(
    (value: boolean) => setAddonState({ ...state, isOutdated: value }),
    [state, setAddonState]
  );
  const setIsRunning = useCallback(
    (value: boolean) => setAddonState({ ...state, isRunning: value }),
    [state, setAddonState]
  );

  const emit = useChannel({});

  const runDevBuild = useCallback(() => {
    if (state.isRunning) return;
    setAddonState({ ...state, isRunning: true });
    emit(START_BUILD);
  }, [emit, state, setAddonState]);

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
    return (
      <Provider key={PANEL_ID} value={client}>
        <LinkedProject projectId={projectId} goToNext={clearProjectIdChanged} />
      </Provider>
    );
  }
  return (
    <Provider key={PANEL_ID} value={client}>
      <VisualTests
        projectId={projectId}
        branch={GIT_BRANCH}
        isOutdated={state.isOutdated}
        isRunning={state.isRunning}
        lastDevBuildId={state.lastBuildId}
        runDevBuild={runDevBuild}
        setAccessToken={setAccessToken}
        setIsOutdated={setIsOutdated}
        setIsRunning={setIsRunning}
        storyId={storyId}
      />
    </Provider>
  );
};
