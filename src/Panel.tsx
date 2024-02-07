import type { API } from "@storybook/manager-api";
import { useChannel, useStorybookState } from "@storybook/manager-api";
import React, { useCallback, useState } from "react";

import { Spinner } from "./components/design-system";
import { Sections } from "./components/layout";
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO,
  GIT_INFO_ERROR,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
  REMOVE_ADDON,
  START_BUILD,
} from "./constants";
import { Project } from "./gql/graphql";
import { Authentication } from "./screens/Authentication/Authentication";
import { GitNotFound } from "./screens/GitNotFound/GitNotFound";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkingProjectFailed } from "./screens/LinkProject/LinkingProjectFailed";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { UninstallProvider } from "./screens/Uninstalled/UninstallContext";
import { Uninstalled } from "./screens/Uninstalled/Uninstalled";
import { ControlsProvider } from "./screens/VisualTests/ControlsContext";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import {
  ConfigInfoPayload,
  GitInfoPayload,
  LocalBuildProgress,
  UpdateStatusFunction,
} from "./types";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";
import { useSharedState } from "./utils/useSharedState";

interface PanelProps {
  active: boolean;
  api: API;
}

export const Panel = ({ active, api }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();

  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);
  const [isOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const [localBuildProgress, setLocalBuildProgress] =
    useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);
  const [, setOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const emit = useChannel({});

  const updateBuildStatus = useCallback<UpdateStatusFunction>(
    (update) => api.experimental_updateStatus(ADDON_ID, update),
    [api]
  );
  const {
    loading: projectInfoLoading,
    projectId,
    configFile,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated,
  } = useProjectId();

  // If the user creates a project in a dialog (either during login or later, it get set here)
  const [createdProjectId, setCreatedProjectId] = useState<Project["id"]>();
  const [addonUninstalled, setAddonUninstalled] = useSharedState<boolean>(REMOVE_ADDON);

  if (addonUninstalled) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <Sections hidden={!active}>
            <Uninstalled />
          </Sections>
        </UninstallProvider>
      </Provider>
    );
  }

  if (gitInfoError) {
    // eslint-disable-next-line no-console
    console.error(gitInfoError);
    return (
      <Provider key={PANEL_ID} value={client}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <Sections hidden={!active}>
            <GitNotFound gitInfoError={gitInfoError} setAccessToken={setAccessToken} />
          </Sections>
        </UninstallProvider>
      </Provider>
    );
  }

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <Sections hidden={!active}>
            <Authentication
              key={PANEL_ID}
              setAccessToken={setAccessToken}
              setCreatedProjectId={setCreatedProjectId}
              hasProjectId={!!projectId}
            />
          </Sections>
        </UninstallProvider>
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
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <Sections hidden={!active}>
            <LinkProject
              createdProjectId={createdProjectId}
              setCreatedProjectId={setCreatedProjectId}
              onUpdateProject={updateProject}
              setAccessToken={setAccessToken}
            />
          </Sections>
        </UninstallProvider>
      </Provider>
    );

  if (projectUpdatingFailed) {
    // These should always be set when we get this error
    if (!configFile) {
      throw new Error(`Missing config file after configuration failure`);
    }

    return (
      <UninstallProvider
        addonUninstalled={addonUninstalled}
        setAddonUninstalled={setAddonUninstalled}
      >
        <Sections hidden={!active}>
          <LinkingProjectFailed
            projectId={projectId}
            configFile={configFile}
            setAccessToken={setAccessToken}
          />
        </Sections>
      </UninstallProvider>
    );
  }

  if (projectIdUpdated) {
    // This should always be set when we succeed
    if (!configFile) throw new Error(`Missing config file after configuration success`);

    return (
      <Provider key={PANEL_ID} value={client}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <Sections hidden={!active}>
            <LinkedProject
              projectId={projectId}
              configFile={configFile}
              goToNext={clearProjectIdUpdated}
              setAccessToken={setAccessToken}
            />
          </Sections>
        </UninstallProvider>
      </Provider>
    );
  }

  const localBuildIsRightBranch = gitInfo.branch === localBuildProgress?.branch;
  return (
    <Provider key={PANEL_ID} value={client}>
      <UninstallProvider
        addonUninstalled={addonUninstalled}
        setAddonUninstalled={setAddonUninstalled}
      >
        <Sections hidden={!active}>
          <ControlsProvider>
            <VisualTests
              dismissBuildError={() => setLocalBuildProgress(undefined)}
              isOutdated={!!isOutdated}
              localBuildProgress={localBuildIsRightBranch ? localBuildProgress : undefined}
              startDevBuild={() => emit(START_BUILD, { accessToken })}
              setAccessToken={setAccessToken}
              setOutdated={setOutdated}
              updateBuildStatus={updateBuildStatus}
              projectId={projectId}
              gitInfo={gitInfo}
              storyId={storyId}
            />
          </ControlsProvider>
        </Sections>
      </UninstallProvider>
    </Provider>
  );
};
