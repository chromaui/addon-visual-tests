import { Spinner } from "@storybook/design-system";
import type { API } from "@storybook/manager-api";
import { useChannel, useStorybookState } from "@storybook/manager-api";
import React, { useCallback, useState } from "react";

import { Sections } from "./components/layout";
import {
  ADDON_ID,
  GIT_INFO,
  GIT_INFO_ERROR,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
  START_BUILD,
} from "./constants";
import { Project } from "./gql/graphql";
import { Authentication } from "./screens/Authentication/Authentication";
import { GitNotFound } from "./screens/GitNotFound/GitNotFound";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkingProjectFailed } from "./screens/LinkProject/LinkingProjectFailed";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "./types";
import { useAddonState } from "./useAddonState/manager";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
  api: API;
}

export const Panel = ({ active, api }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();

  const [gitInfo] = useAddonState<GitInfoPayload>(GIT_INFO);
  const [gitInfoError] = useAddonState<Error>(GIT_INFO_ERROR);
  const [localBuildProgress, setLocalBuildProgress] =
    useAddonState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);
  const [, setOutdated] = useAddonState<boolean>(IS_OUTDATED);
  const emit = useChannel({});

  const updateBuildStatus = useCallback<UpdateStatusFunction>(
    (update) => api.experimental_updateStatus(ADDON_ID, update),
    [api]
  );
  const {
    loading: projectInfoLoading,
    projectId,
    projectToken,
    configFile,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated,
  } = useProjectId();

  // If the user creates a project in a dialog (either during login or later, it get set here)
  const [createdProjectId, setCreatedProjectId] = useState<Project["id"]>();

  if (gitInfoError) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <GitNotFound gitInfoError={gitInfoError} />
        </Sections>
      </Provider>
    );
  }

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <Authentication
            key={PANEL_ID}
            setAccessToken={setAccessToken}
            setCreatedProjectId={setCreatedProjectId}
            hasProjectId={!!projectId}
          />
        </Sections>
      </Provider>
    );
  }

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading || !gitInfo) {
    return active ? <Spinner /> : null;
  }

  if (!projectId)
    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <LinkProject
            createdProjectId={createdProjectId}
            setCreatedProjectId={setCreatedProjectId}
            onUpdateProject={updateProject}
            setAccessToken={setAccessToken}
          />
        </Sections>
      </Provider>
    );

  if (projectUpdatingFailed) {
    // These should always be set when we get this error
    if (!projectToken || !configFile) {
      throw new Error(`Missing projectToken/config file after configuration failure`);
    }

    return (
      <Sections hidden={!active}>
        <LinkingProjectFailed
          projectId={projectId}
          projectToken={projectToken}
          configFile={configFile}
        />
      </Sections>
    );
  }

  if (projectIdUpdated) {
    // This should always be set when we succeed
    if (!configFile) throw new Error(`Missing config file after configuration success`);

    return (
      <Provider key={PANEL_ID} value={client}>
        <Sections hidden={!active}>
          <LinkedProject
            projectId={projectId}
            configFile={configFile}
            goToNext={clearProjectIdUpdated}
            setAccessToken={setAccessToken}
          />
        </Sections>
      </Provider>
    );
  }

  const localBuildIsRightBranch = gitInfo.branch === localBuildProgress?.branch;
  return (
    <Provider key={PANEL_ID} value={client}>
      <Sections hidden={!active}>
        <VisualTests
          dismissBuildError={() => setLocalBuildProgress(undefined)}
          localBuildProgress={localBuildIsRightBranch ? localBuildProgress : undefined}
          startDevBuild={() => emit(START_BUILD)}
          setAccessToken={setAccessToken}
          setOutdated={setOutdated}
          updateBuildStatus={updateBuildStatus}
          projectId={projectId}
          gitInfo={gitInfo}
          storyId={storyId}
        />
      </Sections>
    </Provider>
  );
};
