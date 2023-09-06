import { logger } from "@storybook/client-logger";
import { Spinner } from "@storybook/design-system";
import type { API } from "@storybook/manager-api";
import { useChannel, useStorybookApi, useStorybookState } from "@storybook/manager-api";
import React, { useCallback, useEffect } from "react";

import {
  ADDON_ID,
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

export const Panel = ({ active, api }: PanelProps) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const { storyId } = useStorybookState();
  const { addNotification } = useStorybookApi();

  const [gitInfo] = useAddonState<GitInfoPayload>(GIT_INFO);
  const [runningBuild] = useAddonState<RunningBuildPayload>(RUNNING_BUILD);
  const emit = useChannel({});

  useEffect(() => {
    if (runningBuild?.step === "complete") {
      addNotification({
        id: "chromatic/build-complete",
        link: "https://www.chromatic.com/docs/cli",
        content: {
          headline: "Build complete",
          subHeadline:
            "Your build is complete. Check the terminal running storybook for more details.",
        },
        icon: {
          name: "check",
          color: "green",
        },
      });
    }
    if (runningBuild?.step === "error") {
      logger.error("Build error:", runningBuild.originalError);
      addNotification({
        id: "chromatic/build-error",
        link: "https://www.chromatic.com/docs/cli",
        content: {
          headline: "Build error",
          subHeadline:
            "There was an error running your build. Check the terminal running storybook for more details.",
          // Not we do not show the full error message because it is long and formatted for the terminal.
        },
        icon: {
          name: "alert",
          color: "red",
        },
      });
    }
  }, [addNotification, runningBuild?.step, runningBuild?.originalError]);

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

  // Render a hidden element when the addon panel is not active.
  // Storybook's AddonPanel component does the same but it's not styleable so we don't use it.
  if (!active) return <div hidden key={PANEL_ID} />;

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) return <Authentication key={PANEL_ID} setAccessToken={setAccessToken} />;

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading || !gitInfo) {
    return <Spinner />;
  }

  if (!projectId)
    return (
      <Provider key={PANEL_ID} value={client}>
        <LinkProject onUpdateProject={updateProject} setAccessToken={setAccessToken} />
      </Provider>
    );

  if (projectUpdatingFailed) {
    return (
      <LinkingProjectFailed
        projectId={projectId}
        projectToken={projectToken}
        mainPath={mainPath}
        configDir={configDir}
      />
    );
  }

  if (projectIdUpdated) {
    return (
      <Provider key={PANEL_ID} value={client}>
        <LinkedProject
          projectId={projectId}
          mainPath={mainPath}
          goToNext={clearProjectIdUpdated}
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
        runningBuild={runningBuild}
        startDevBuild={() => emit(START_BUILD)}
        setAccessToken={setAccessToken}
        updateBuildStatus={updateBuildStatus}
        storyId={storyId}
      />
    </Provider>
  );
};
