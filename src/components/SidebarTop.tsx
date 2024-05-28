import { type API, useStorybookState } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import pluralize from "pluralize";
import React, { useCallback, useContext, useEffect, useRef } from "react";

import {
  ADDON_ID,
  API_INFO,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
} from "../constants";
import { APIInfoPayload, ConfigInfoPayload, LocalBuildProgress } from "../types";
import { useAccessToken } from "../utils/graphQLClient";
import { TelemetryContext } from "../utils/TelemetryContext";
import { useBuildEvents } from "../utils/useBuildEvents";
import { useProjectId } from "../utils/useProjectId";
import { useSharedState } from "../utils/useSharedState";
import { SidebarTopButton } from "./SidebarTopButton";

interface SidebarTopProps {
  api: API;
}

export const SidebarTop = ({ api }: SidebarTopProps) => {
  const { addNotification, clearNotification, selectStory, setOptions, togglePanel } = api;

  const trackEvent = useContext(TelemetryContext);
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [isOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);

  const [apiInfo] = useSharedState<APIInfoPayload>(API_INFO);
  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const lastStep = useRef(localBuildProgress?.currentStep);
  const { index, status, storyId, viewMode } = useStorybookState();
  const changedStoryCount = Object.values(status).filter(
    (value) => value[ADDON_ID]?.status === "warn"
  );

  const openVisualTestsPanel = useCallback(
    (warning?: string) => {
      setOptions({ selectedPanel: PANEL_ID });
      togglePanel(true);
      if (index && viewMode !== "story") {
        // Select the next story in the index, because docs mode doesn't show addon panels
        const currentIndex = Object.keys(index).indexOf(storyId);
        const entries = Object.entries(index).slice(currentIndex > 0 ? currentIndex : 0);
        const [nextStoryId] = entries.find(([, { type }]) => type === "story") || [];
        if (nextStoryId) selectStory(nextStoryId);
      }
      if (warning) {
        trackEvent?.({ action: "openWarning", warning });
      }
    },
    [setOptions, togglePanel, trackEvent, index, selectStory, storyId, viewMode]
  );

  const clickNotification = useCallback(
    ({ onDismiss }) => {
      onDismiss();
      openVisualTestsPanel();
    },
    [openVisualTestsPanel]
  );

  useEffect(() => {
    if (localBuildProgress?.currentStep === lastStep.current) return;
    lastStep.current = localBuildProgress?.currentStep;

    if (localBuildProgress?.currentStep === "initialize") {
      addNotification({
        id: `${ADDON_ID}/build-initialize`,
        content: {
          headline: "Build started",
          subHeadline: "Check the visual test addon to see the progress of your build.",
        },
        icon: {
          name: "passed",
          color: color.positive,
        },
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(`${ADDON_ID}/build-initialize`), 8_000);
    }

    if (localBuildProgress?.currentStep === "aborted") {
      addNotification({
        id: `${ADDON_ID}/build-aborted`,
        content: {
          headline: "Build canceled",
          subHeadline: "Aborted by user.",
        },
        icon: {
          name: "failed",
          color: color.negative,
        },
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(`${ADDON_ID}/build-aborted`), 8_000);
    }

    if (localBuildProgress?.currentStep === "complete") {
      addNotification({
        id: `${ADDON_ID}/build-complete`,
        content: {
          headline: "Build complete",
          // eslint-disable-next-line no-nested-ternary
          subHeadline: localBuildProgress.errorCount
            ? `Encountered ${pluralize("component error", localBuildProgress.errorCount, true)}`
            : changedStoryCount.length
            ? `Found ${pluralize("story", changedStoryCount.length, true)} with ${pluralize(
                "change",
                changedStoryCount.length
              )}`
            : "No visual changes detected",
        },
        icon: {
          name: "passed",
          color: color.positive,
        },
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(`${ADDON_ID}/build-complete`), 8_000);
    }

    if (localBuildProgress?.currentStep === "error") {
      addNotification({
        id: `${ADDON_ID}/build-error`,
        content: {
          headline: "Build error",
          subHeadline: "Check the Storybook process on the command line for more details.",
        },
        icon: {
          name: "failed",
          color: color.negative,
        },
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        onClick: clickNotification,
      });
    }

    if (localBuildProgress?.currentStep === "limited") {
      addNotification({
        id: `${ADDON_ID}/build-limited`,
        content: {
          headline: "Build limited",
          subHeadline:
            "Your account has insufficient snapshots remaining to run this build. Visit your billing page to find out more.",
        },
        icon: {
          name: "failed",
          color: color.negative,
        },
        // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
        onClick: clickNotification,
      });
    }
  }, [
    addNotification,
    clearNotification,
    clickNotification,
    localBuildProgress?.currentStep,
    localBuildProgress?.errorCount,
    localBuildProgress?.changeCount,
    changedStoryCount.length,
  ]);

  const { isRunning, startBuild, stopBuild } = useBuildEvents({ localBuildProgress, accessToken });

  let warning: string | undefined;
  if (apiInfo?.connected === false) warning = "Visual tests locked while waiting for network.";
  if (!projectId) warning = "Visual tests locked until a project is selected.";
  if (!isLoggedIn) warning = "Visual tests locked until you are logged in.";
  if (gitInfoError) warning = "Visual tests locked due to Git synchronization problem.";
  if (hasConfigProblem) warning = "Visual tests locked due to configuration problem.";

  const clickWarning = useCallback(
    () => openVisualTestsPanel(warning),
    [openVisualTestsPanel, warning]
  );

  if (global.CONFIG_TYPE !== "DEVELOPMENT") {
    return null;
  }

  return (
    <SidebarTopButton
      isDisabled={!!warning}
      isOutdated={isOutdated}
      isRunning={isRunning}
      localBuildProgress={localBuildProgress}
      warning={warning}
      clickWarning={clickWarning}
      startBuild={startBuild}
      stopBuild={stopBuild}
    />
  );
};
