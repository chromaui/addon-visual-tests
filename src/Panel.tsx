import {
  useAddonState,
  useChannel,
  useStorybookApi,
  useStorybookState,
} from "@storybook/manager-api";
// eslint-disable-next-line import/no-unresolved
import { GitInfo } from "chromatic/node";
import React, { useCallback, useState } from "react";

import { ADDON_ID, GIT_INFO, PANEL_ID, START_BUILD } from "./constants";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { AddonState } from "./types";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { StatusUpdate } from "./utils/testsToStatusUpdate";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
}

const { GIT_BRANCH, GIT_SLUG, GIT_COMMIT } = process.env;

export const Panel = ({ active }: PanelProps) => {
  const api = useStorybookApi();
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();

  const [{ isRunning, lastBuildId }, setAddonState] = useAddonState<AddonState>(ADDON_ID, {
    isRunning: false,
  });

  const setIsRunning = useCallback(
    (value: boolean) => setAddonState({ isRunning: value, lastBuildId }),
    [lastBuildId, setAddonState]
  );

  const [gitInfo, setGitInfo] = useState<GitInfo>({
    branch: GIT_BRANCH,
    commit: GIT_COMMIT,
    slug: GIT_SLUG,
    uncommittedHash: "",
  });

  const emit = useChannel({ [GIT_INFO]: (info: GitInfo) => setGitInfo(info) }, [setGitInfo]);

  const runDevBuild = useCallback(() => {
    if (isRunning) return;
    setAddonState({ isRunning: true, lastBuildId });
    emit(START_BUILD);
  }, [emit, isRunning, lastBuildId, setAddonState]);

  const updateBuildStatus = useCallback(
    (update: StatusUpdate) => {
      api.experimental_updateStatus(ADDON_ID, update);
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
        <LinkProject onUpdateProject={updateProject} setAccessToken={setAccessToken} />
      </Provider>
    );

  if (projectIdChanged) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <LinkedProject
          projectId={projectId}
          goToNext={clearProjectIdChanged}
          setAccessToken={setAccessToken}
        />
      </Provider>
    );
  }
  return (
    <Provider key={PANEL_ID} value={client}>
      <VisualTests
        projectId={projectId}
        gitInfo={gitInfo}
        isRunning={isRunning}
        lastDevBuildId={lastBuildId}
        runDevBuild={runDevBuild}
        setAccessToken={setAccessToken}
        setIsRunning={setIsRunning}
        updateBuildStatus={updateBuildStatus}
        storyId={storyId}
      />
    </Provider>
  );
};
