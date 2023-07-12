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
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { AddonState, CompletedBuild, StartedBuild } from "./types";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { testsToStatusUpdate } from "./utils/testsToStatusUpdate";

interface PanelProps {
  active: boolean;
}

export const Panel = ({ active }: PanelProps) => {
  const api = useStorybookApi();
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

  const updateBuildStatus = useCallback(
    (build: StartedBuild | CompletedBuild) => {
      api.experimental_updateStatus(
        ADDON_ID,
        testsToStatusUpdate(build.tests.nodes as TestFieldsFragment[])
      );
    },
    [api]
  );

  // Render a hidden element when the addon panel is not active.
  // Storybook's AddonPanel component does the same but it's not styleable so we don't use it.
  if (!active) return <div hidden key={PANEL_ID} />;

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) return <Authentication key={PANEL_ID} setAccessToken={setAccessToken} />;

  return (
    <Provider key={PANEL_ID} value={client}>
      <VisualTests
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
