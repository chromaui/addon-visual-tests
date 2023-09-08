import { type API, useChannel } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import pluralize from "pluralize";
import React, { useEffect, useRef } from "react";

import { SidebarTopButton } from "./components/SidebarTopButton";
import { ADDON_ID, IS_OUTDATED, RUNNING_BUILD, START_BUILD } from "./constants";
import { RunningBuildPayload } from "./types";
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
  const [runningBuild] = useAddonState<RunningBuildPayload>(RUNNING_BUILD);
  const isRunning = !!runningBuild && runningBuild.step !== "complete";

  const lastStep = useRef(runningBuild?.step);
  useEffect(() => {
    if (runningBuild?.step === lastStep.current) return;
    lastStep.current = runningBuild?.step;

    if (runningBuild?.step === "initialize") {
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

    if (runningBuild?.step === "complete") {
      addNotification({
        id: `${ADDON_ID}/build-complete`,
        content: {
          headline: "Build complete",
          // eslint-disable-next-line no-nested-ternary
          subHeadline: runningBuild.errorCount
            ? `Encountered ${pluralize("component error", runningBuild.errorCount, true)}`
            : runningBuild.changeCount
            ? `Found ${pluralize("change", runningBuild.changeCount, true)}`
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

    if (runningBuild?.step === "error") {
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
    runningBuild?.step,
    runningBuild?.errorCount,
    runningBuild?.changeCount,
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
      runningBuild={runningBuild}
      startBuild={startBuild}
    />
  );
};
