import { type API, useChannel } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import pluralize from "pluralize";
import React, { useEffect, useRef } from "react";

import { SidebarTopButton } from "./components/SidebarTopButton";
import { ADDON_ID, IS_OUTDATED, LOCAL_BUILD_PROGRESS, START_BUILD } from "./constants";
import { LocalBuildProgressPayload } from "./types";
import { useAddonState } from "./useAddonState/manager";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

interface SidebarTopProps {
  api: API;
}

export const SidebarTop = ({ api }: SidebarTopProps) => {
  const { addNotification, clearNotification } = api;

  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [isOutdated] = useAddonState<boolean>(IS_OUTDATED);
  const [localBuildProgress] = useAddonState<LocalBuildProgressPayload>(LOCAL_BUILD_PROGRESS);
  const isRunning = !!localBuildProgress && localBuildProgress.currentStep !== "complete";

  const lastStep = useRef(localBuildProgress?.currentStep);
  useEffect(() => {
    if (localBuildProgress?.currentStep === lastStep.current) return;
    lastStep.current = localBuildProgress?.currentStep;

    if (localBuildProgress?.currentStep === "initialize") {
      addNotification({
        id: `${ADDON_ID}/build-initialize`,
        content: {
          headline: "Build started",
          subHeadline: "Check the Storybook process on the command line for more details.",
        },
        icon: {
          name: "passed",
          color: color.positive,
        },
        link: undefined,
      });
      setTimeout(() => clearNotification(`${ADDON_ID}/build-initialize`), 10_000);
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
  const startBuild = () => emit(START_BUILD);

  if (!projectId || isLoggedIn === false) {
    return null;
  }

  return (
    <SidebarTopButton
      isOutdated={isOutdated}
      isRunning={isRunning}
      localBuildProgress={localBuildProgress}
      startBuild={startBuild}
    />
  );
};
