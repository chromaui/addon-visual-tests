import type { API } from "@storybook/manager-api";
import {
  useAddonState,
  useChannel,
  useStorybookApi,
  useStorybookState,
} from "@storybook/manager-api";
import React, { useCallback } from "react";

import { ADDON_ID, PANEL_ID, START_BUILD } from "./constants";
import { TestFieldsFragment } from "./gql/graphql";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { AddonState, BuildWithTests } from "./types";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { StatusUpdate, testsToStatusUpdate } from "./utils/testsToStatusUpdate";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
}

const { GIT_BRANCH, GIT_SLUG } = process.env;

let lastUpdateStr: string;
const i = 0;
const updateStatusMemoized = (api: API, statusUpdate: StatusUpdate) => {
  const updateStr = JSON.stringify(statusUpdate);
  if (updateStr !== lastUpdateStr) {
    lastUpdateStr = updateStr;
    api.experimental_updateStatus(ADDON_ID, statusUpdate);
  }
};

export const Panel = ({ active }: PanelProps) => {
  const api = useStorybookApi();
  const [accessToken, setAccessToken] = useAccessToken();

  const [state, setAddonState] = useAddonState<AddonState>(ADDON_ID, { isOutdated: false });
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

  const updateBuildStatus = useCallback(
    (build: BuildWithTests) => {
      updateStatusMemoized(api, testsToStatusUpdate(build.tests.nodes as TestFieldsFragment[]));
    },
    [api]
  );
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

  if (projectIdChanged) {
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
        slug={GIT_SLUG}
        isOutdated={state.isOutdated}
        isRunning={state.isRunning}
        lastDevBuildId={state.lastBuildId}
        runDevBuild={runDevBuild}
        setAccessToken={setAccessToken}
        setIsOutdated={setIsOutdated}
        setIsRunning={setIsRunning}
        updateBuildStatus={updateBuildStatus}
        storyId={storyId}
      />
    </Provider>
  );
};
