import { Icons, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { RunningBuildPayload } from "../types";
import { BuildProgressLabel } from "./BuildProgressLabel";
import { IconButton } from "./IconButton";
import { StatusDotWrapper } from "./StatusDot";

export const TooltipContent = styled.div(({ theme }) => ({
  width: 200,
  padding: 3,
  color: theme.color.defaultText,

  "& > div": {
    margin: 7,
  },
}));

export const ProgressTrack = styled.div(({ theme }) => ({
  height: 5,
  background: theme.background.hoverable,
  borderRadius: 1,
}));

export const ProgressBar = styled(ProgressTrack)(({ theme }) => ({
  background: theme.color.secondary,
}));

export const ProgressCircle = styled.svg(({ theme }) => ({
  position: "absolute",
  width: `24px!important`,
  height: `24px!important`,
  transform: "rotate(-90deg)",
  color: theme.color.secondary,
}));

export const SidebarIconButton = styled(IconButton)<ComponentProps<typeof IconButton>>(
  ({ theme }) => ({
    position: "relative",
    overflow: "visible",
    color: theme.textMutedColor,
    marginTop: 0,
    zIndex: 1,
  })
);

export const SidebarTopButton = ({
  isOutdated = false,
  isRunning = false,
  runningBuild,
  startBuild,
}: {
  isOutdated?: boolean;
  isRunning?: boolean;
  runningBuild?: RunningBuildPayload;
  startBuild: () => void;
}) => {
  if (isRunning && runningBuild) {
    return (
      <WithTooltip
        trigger="hover"
        tooltip={
          <TooltipContent>
            <div>
              <BuildProgressLabel runningBuild={runningBuild} />
            </div>
            <ProgressTrack>
              {typeof runningBuild.buildProgressPercentage === "number" && (
                <ProgressBar style={{ width: `${runningBuild.buildProgressPercentage}%` }} />
              )}
            </ProgressTrack>
          </TooltipContent>
        }
      >
        <SidebarIconButton aria-label="Run tests">
          <Icons icon="play" />
          {typeof runningBuild.buildProgressPercentage === "number" && (
            <ProgressCircle xmlns="http://www.w3.org/2000/svg">
              <circle
                r="10"
                cx="12"
                cy="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={Math.PI * 20}
                strokeDashoffset={Math.PI * 20 * (1 - runningBuild.buildProgressPercentage / 100)}
                fill="transparent"
              />
            </ProgressCircle>
          )}
        </SidebarIconButton>
      </WithTooltip>
    );
  }

  return isOutdated ? (
    <SidebarIconButton aria-label="Run tests" onClick={() => startBuild()}>
      <StatusDotWrapper status="notification">
        <Icons icon="play" />
      </StatusDotWrapper>
    </SidebarIconButton>
  ) : (
    <WithTooltip
      trigger="click"
      closeOnOutsideClick
      tooltip={
        <TooltipContent>
          <div>No code changes detected. Rerun tests to take new snapshots.</div>
          <IconButton onClick={() => startBuild()}>
            <Icons icon="sync" />
            Rerun tests
          </IconButton>
        </TooltipContent>
      }
    >
      <SidebarIconButton aria-label="Run tests">
        <Icons icon="play" />
      </SidebarIconButton>
    </WithTooltip>
  );
};
