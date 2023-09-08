import { Spinner } from "@storybook/design-system";
import type { API } from "@storybook/manager-api";
import { useChannel, useStorybookState } from "@storybook/manager-api";
import React, { useCallback } from "react";

import { Sections } from "./components/layout";
import {
  ADDON_ID,
  CHROMATIC_BASE_URL,
  DEV_BUILD_ID_KEY,
  GIT_INFO,
  GitInfoPayload,
  PANEL_ID,
  RUNNING_BUILD,
  RunningBuildPayload,
  START_BUILD,
} from "./constants";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkingProjectFailed } from "./screens/LinkProject/LinkingProjectFailed";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { UpdateStatusFunction } from "./types";
import { useAddonState } from "./useAddonState/manager";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
  api: API;
}

const storedBuildId = localStorage.getItem(DEV_BUILD_ID_KEY);

export const Panel = ({ active, api }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();

  const [gitInfo] = useAddonState<GitInfoPayload>(GIT_INFO);
  const [runningBuild] = useAddonState<RunningBuildPayload>(RUNNING_BUILD);
  const emit = useChannel({});

  const updateBuildStatus = useCallback<UpdateStatusFunction>(
    (update) => api.experimental_updateStatus(ADDON_ID, update),
    [api]
  );
  const {
    loading: projectInfoLoading,
    projectId,
    projectToken,
    configDir,
    mainPath,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated,
  } = useProjectId();

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) return <Authentication key={PANEL_ID} setAccessToken={setAccessToken} />;

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading || !gitInfo) {
    return <Spinner />;
  }

  if (!projectId)
    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <LinkProject
            onUpdateProject={updateProject}
            setAccessToken={setAccessToken}
            chromaticBaseUrl={CHROMATIC_BASE_URL}
          />
        </Sections>
      </Provider>
    );

  if (projectUpdatingFailed) {
    return (
      <Sections hidden={!active}>
        <LinkingProjectFailed
          projectId={projectId}
          projectToken={projectToken}
          mainPath={mainPath}
          configDir={configDir}
        />
      </Sections>
    );
  }

  if (projectIdUpdated) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <LinkedProject
            projectId={projectId}
            mainPath={mainPath}
            goToNext={clearProjectIdUpdated}
            setAccessToken={setAccessToken}
          />
        </Sections>
      </Provider>
    );
  }

  return (
    <Provider key={PANEL_ID} value={client}>
      <Sections hidden={!active}>
        <VisualTests
          projectId={projectId}
          gitInfo={gitInfo}
          runningBuild={runningBuild}
          startDevBuild={() => emit(START_BUILD)}
          setAccessToken={setAccessToken}
          updateBuildStatus={updateBuildStatus}
          storyId={storyId}
        />
      </Sections>
    </Provider>
  );
};
