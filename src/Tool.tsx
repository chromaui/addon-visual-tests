import { IconButton, Icons, WithTooltip } from "@storybook/components";
import { useChannel } from "@storybook/manager-api";
import { styled } from "@storybook/theming";
import React, { ComponentProps, FC } from "react";

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

  const emit = useChannel({});
  const startBuild = () => emit(START_BUILD);

  if (!projectId || isLoggedIn === false) {
    return null;
  }

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
