import { type API, useChannel } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import pluralize from "pluralize";
import React, { useEffect, useRef } from "react";

import { SidebarTopButton } from "./components/SidebarTopButton";
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
  START_BUILD,
  STOP_BUILD,
} from "./constants";
import { ConfigInfoPayload, LocalBuildProgress } from "./types";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";
import { useSharedState } from "./utils/useSharedState";

interface SidebarTopProps {
  api: API;
}

export const SidebarTop = ({ api }: SidebarTopProps) => {
  const { addNotification, clearNotification, setOptions, togglePanel } = api;

  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [isOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);
  const isRunning =
    !!localBuildProgress &&
    !["aborted", "complete", "error"].includes(localBuildProgress.currentStep);

  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const lastStep = useRef(localBuildProgress?.currentStep);
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
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
      setTimeout(() => clearNotification(`${ADDON_ID}/build-initialize`), 10_000);
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
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
      setTimeout(() => clearNotification(`${ADDON_ID}/build-aborted`), 10_000);
    }

    if (localBuildProgress?.currentStep === "complete") {
      addNotification({
        id: `${ADDON_ID}/build-complete`,
        content: {
          headline: "Build complete",
          // eslint-disable-next-line no-nested-ternary
          subHeadline: localBuildProgress.errorCount
            ? `Encountered ${pluralize("component error", localBuildProgress.errorCount, true)}`
            : localBuildProgress.changeCount
            ? `Found ${pluralize("change", localBuildProgress.changeCount, true)}`
            : "No visual changes detected",
        },
        icon: {
          name: "passed",
          color: color.positive,
        },
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
      setTimeout(() => clearNotification(`${ADDON_ID}/build-complete`), 10_000);
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
        // @ts-expect-error SB needs a proper API for no link
        link: undefined,
      });
    }
  }, [
    addNotification,
    clearNotification,
    localBuildProgress?.currentStep,
    localBuildProgress?.errorCount,
    localBuildProgress?.changeCount,
  ]);

  const emit = useChannel({});
  const startBuild = () => emit(START_BUILD, { accessToken });
  const stopBuild = () => emit(STOP_BUILD);

  let warning;
  if (!projectId) warning = "Visual tests locked until a project is selected.";
  if (!isLoggedIn) warning = "Visual tests locked until you are logged in.";
  if (gitInfoError) warning = "Visual tests locked due to Git synchronization problem.";
  if (hasConfigProblem) warning = "Visual tests locked due to configuration problem.";

  return (
    <SidebarTopButton
      isDisabled={!!warning}
      isOutdated={isOutdated}
      isRunning={isRunning}
      localBuildProgress={localBuildProgress}
      warning={warning}
      clickWarning={() => {
        setOptions({ selectedPanel: PANEL_ID });
        togglePanel(true);
      }}
      startBuild={startBuild}
      stopBuild={stopBuild}
    />
  );
};
