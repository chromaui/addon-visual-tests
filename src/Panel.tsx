import { logger } from "@storybook/client-logger";
import { useChannel, useStorybookApi, useStorybookState } from "@storybook/manager-api";
// eslint-disable-next-line import/no-unresolved
import { GitInfo } from "chromatic/node";
import React, { useCallback, useState } from "react";

import {
  ADDON_ID,
  BUILD_ANNOUNCED,
  BUILD_STARTED,
  DEV_BUILD_ID_KEY,
  GIT_INFO,
  PANEL_ID,
  START_BUILD,
} from "./constants";
import { Authentication } from "./screens/Authentication/Authentication";
import { LinkedProject } from "./screens/LinkProject/LinkedProject";
import { LinkProject } from "./screens/LinkProject/LinkProject";
import { VisualTests } from "./screens/VisualTests/VisualTests";
import { client, Provider, useAccessToken } from "./utils/graphQLClient";
import { StatusUpdate } from "./utils/testsToStatusUpdate";
import { useProjectId } from "./utils/useProjectId";

interface PanelProps {
  active: boolean;
}

const {
  GIT_USER_EMAIL,
  GIT_USER_EMAIL_HASH,
  GIT_BRANCH,
  GIT_SLUG,
  GIT_COMMIT,
  GIT_UNCOMMITTED_HASH,
} = process.env;
const initialGitInfo: GitInfo = {
  userEmail: GIT_USER_EMAIL,
  userEmailHash: GIT_USER_EMAIL_HASH,
  branch: GIT_BRANCH,
  commit: GIT_COMMIT,
  slug: GIT_SLUG,
  uncommittedHash: GIT_UNCOMMITTED_HASH,
};

logger.debug("Initial Git info:", initialGitInfo);

const storedBuildId = localStorage.getItem(DEV_BUILD_ID_KEY);

export const Panel = ({ active }: PanelProps) => {
  const api = useStorybookApi();
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();

  const [isStarting, setIsStarting] = useState(false);
  const [lastBuildId, setLastBuildId] = useState(storedBuildId);
  const [gitInfo, setGitInfo] = useState(initialGitInfo);

  const emit = useChannel(
    {
      [START_BUILD]: () => setIsStarting(true),
      [BUILD_STARTED]: () => setIsStarting(false),
      [BUILD_ANNOUNCED]: (buildId: string) => {
        setLastBuildId(buildId);
        localStorage.setItem(DEV_BUILD_ID_KEY, buildId);
      },
      [GIT_INFO]: (info: GitInfo) => {
        setGitInfo(info);
        // Reset the build ID when the Git info changes.
        localStorage.removeItem(DEV_BUILD_ID_KEY);
        logger.debug("Updated Git info:", info);
      },
    },
    []
  );

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
        isStarting={isStarting}
        lastDevBuildId={lastBuildId}
        startDevBuild={() => isStarting || emit(START_BUILD)}
        setAccessToken={setAccessToken}
        updateBuildStatus={updateBuildStatus}
        storyId={storyId}
      />
    </Provider>
  );
};
