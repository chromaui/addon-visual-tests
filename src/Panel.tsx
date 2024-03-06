import type { API } from "@storybook/manager-api";
import { useChannel, useStorybookState } from "@storybook/manager-api";
import React, { useCallback, useState } from "react";

import { AuthProvider } from "./AuthContext";
import { Spinner } from "./components/design-system";
import {
  ADDON_ID,
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
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "./types";
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

  const withProviders = (children: React.ReactNode) => (
    <Provider key={PANEL_ID} value={client}>
      <AuthProvider value={{ accessToken, setAccessToken }}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <div hidden={!active} style={{ containerType: "size", height: "100%" }}>
            {children}
          </div>
        </UninstallProvider>
      </AuthProvider>
    </Provider>
  );

  if (addonUninstalled) {
    return withProviders(<Uninstalled />);
  }

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) {
    return withProviders(
      <Authentication
        key={PANEL_ID}
        setAccessToken={setAccessToken}
        setCreatedProjectId={setCreatedProjectId}
        hasProjectId={!!projectId}
      />
    );
  }

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading) {
    return active ? <Spinner /> : null;
  }

  if (!projectId)
    return withProviders(
      <LinkProject
        createdProjectId={createdProjectId}
        setCreatedProjectId={setCreatedProjectId}
        onUpdateProject={updateProject}
      />
    );

  // @ts-expect-error no global types yet
  if (global.CONFIG_TYPE === "DEVELOPMENT" && (gitInfoError || !gitInfo)) {
    // eslint-disable-next-line no-console
    console.error(gitInfoError);
    return withProviders(<GitNotFound />);
  }

  if (projectUpdatingFailed) {
    // These should always be set when we get this error
    if (!configFile) throw new Error(`Missing config file after configuration failure`);
    return withProviders(<LinkingProjectFailed projectId={projectId} configFile={configFile} />);
  }

  if (projectIdUpdated) {
    // This should always be set when we succeed
    if (!configFile) throw new Error(`Missing config file after configuration success`);

    return withProviders(
      <LinkedProject
        projectId={projectId}
        configFile={configFile}
        goToNext={clearProjectIdUpdated}
      />
    );
  }

  const localBuildIsRightBranch = gitInfo?.branch === localBuildProgress?.branch;
  return withProviders(
    <ControlsProvider>
      <VisualTests
        dismissBuildError={() => setLocalBuildProgress(undefined)}
        isOutdated={!!isOutdated}
        localBuildProgress={localBuildIsRightBranch ? localBuildProgress : undefined}
        startDevBuild={() => emit(START_BUILD, { accessToken })}
        setOutdated={setOutdated}
        updateBuildStatus={updateBuildStatus}
        projectId={projectId}
        gitInfo={gitInfo}
        storyId={storyId}
      />
    </ControlsProvider>
  );
};
