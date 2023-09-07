import { logger } from "@storybook/client-logger";
import { IconButton, Icons, WithTooltip } from "@storybook/components";
import { useChannel, useStorybookApi } from "@storybook/manager-api";
import { styled } from "@storybook/theming";
import React, { ComponentProps, useEffect, useRef } from "react";

import { RUNNING_BUILD, RunningBuildPayload, START_BUILD } from "./constants";
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

  const { addNotification } = useStorybookApi();

  const lastStep = useRef(runningBuild?.step);
  useEffect(() => {
    if (runningBuild?.step === lastStep.current) return;
    lastStep.current = runningBuild?.step;

    if (runningBuild?.step === "complete") {
      addNotification({
        id: "chromatic/build-complete",
        link: undefined,
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
        link: undefined,
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
