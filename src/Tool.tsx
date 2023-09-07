import { IconButton, Icons, WithTooltip } from "@storybook/components";
import { useChannel, useStorybookApi } from "@storybook/manager-api";
import { color, styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { ComponentProps, useEffect, useRef } from "react";

import { ADDON_ID, RUNNING_BUILD, RunningBuildPayload, START_BUILD } from "./constants";
import { useAddonState } from "./useAddonState/manager";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

export const SidebarIconButton = styled(IconButton)<ComponentProps<typeof IconButton>>(
  ({ theme }) => ({
    position: "relative",
    overflow: "visible",
    color: theme.textMutedColor,
    marginTop: 0,
    zIndex: 1,
  })
);

export const Tool = () => {
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [runningBuild] = useAddonState<RunningBuildPayload>(RUNNING_BUILD);
  const isRunning = !!runningBuild && runningBuild.step !== "complete";

  const { addNotification, clearNotification } = useStorybookApi();

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

  return <ToolContent isRunning={isRunning} startBuild={startBuild} />;
};

export const ToolContent = ({
  isRunning = false,
  startBuild,
}: {
  isRunning?: boolean;
  startBuild: () => void;
}) => {
  if (isRunning) {
    return (
      <WithTooltip tooltip="Running visual tests...">
        <SidebarIconButton>
          <Icons icon="play" />
        </SidebarIconButton>
      </WithTooltip>
    );
  }
  return (
    <SidebarIconButton active={false} disabled={false} onClick={() => startBuild()}>
      <Icons icon="play" />
    </SidebarIconButton>
  );
};
