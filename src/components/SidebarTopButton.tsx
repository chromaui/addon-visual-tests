import { IconButton, Icons, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { RunningBuildPayload } from "../constants";
import { BuildProgressLabel } from "./BuildProgressLabel";

export const TooltipContent = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 5,
  minWidth: 200,
  padding: 10,
  color: theme.color.defaultText,
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
  isRunning = false,
  runningBuild,
  startBuild,
}: {
  isRunning?: boolean;
  runningBuild?: RunningBuildPayload;
  startBuild: () => void;
}) => {
  return isRunning && runningBuild ? (
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
  ) : (
    <SidebarIconButton aria-label="Run tests" onClick={() => startBuild()}>
      <Icons icon="play" />
    </SidebarIconButton>
  );
};
