import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { keyframes, styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { LocalBuildProgress } from "../types";
import { BuildProgressLabel } from "./BuildProgressLabel";
import { IconButton } from "./IconButton";
import { StatusDotWrapper } from "./StatusDot";

export const TooltipContent = styled.div(({ theme }) => ({
  width: 220,
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
  transition: "width 3s ease-out",
}));

const rotate = keyframes({
  "0%": {
    transform: "rotate(0deg)",
  },
  "100%": {
    transform: "rotate(360deg)",
  },
});

export const ProgressCircle = styled.svg<{ progress?: boolean; spinner?: boolean }>(
  ({ progress, theme }) => ({
    position: "absolute",
    width: `24px!important`,
    height: `24px!important`,
    transform: "rotate(-90deg)",
    color: theme.color.secondary,
    circle: {
      r: "10",
      cx: "12",
      cy: "12",
      fill: "transparent",
      stroke: progress ? "currentColor" : theme.background.hoverable,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeDasharray: Math.PI * 20,
    },
  }),
  ({ spinner, theme }) =>
    spinner && {
      animation: `${rotate} 1s linear infinite`,
      circle: {
        stroke: `${theme.color.secondary}33`,
      },
    }
);

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
  localBuildProgress,
  startBuild,
  stopBuild,
}: {
  isOutdated?: boolean;
  isRunning?: boolean;
  localBuildProgress?: LocalBuildProgress;
  startBuild: () => void;
  stopBuild: () => void;
}) => {
  if (isRunning && localBuildProgress) {
    const { buildProgressPercentage } = localBuildProgress;
    return (
      <WithTooltip
        trigger="hover"
        tooltip={
          <TooltipContent>
            <div>
              <BuildProgressLabel localBuildProgress={localBuildProgress} withEmoji />
            </div>
            <ProgressTrack>
              {typeof buildProgressPercentage === "number" && (
                <ProgressBar style={{ width: `${buildProgressPercentage}%` }} />
              )}
            </ProgressTrack>
          </TooltipContent>
        }
      >
        <SidebarIconButton aria-label="Stop tests" secondary onClick={() => stopBuild()}>
          <Icons icon="stopalt" style={{ width: 10 }} />
          <ProgressCircle xmlns="http://www.w3.org/2000/svg">
            <circle />
          </ProgressCircle>
          <ProgressCircle xmlns="http://www.w3.org/2000/svg" spinner>
            <circle strokeDashoffset={Math.PI * 20 * (1 - buildProgressPercentage / 100)} />
          </ProgressCircle>
          {typeof buildProgressPercentage === "number" && (
            <ProgressCircle xmlns="http://www.w3.org/2000/svg" progress>
              <circle strokeDashoffset={Math.PI * 20 * (1 - buildProgressPercentage / 100)} />
            </ProgressCircle>
          )}
        </SidebarIconButton>
      </WithTooltip>
    );
  }

  return isOutdated ? (
    <WithTooltip
      tooltip={<TooltipNote note="Code changes detected; click to run tests" />}
      trigger="hover"
      hasChrome={false}
    >
      <SidebarIconButton aria-label="Run tests" onClick={() => startBuild()}>
        <StatusDotWrapper status="notification">
          <Icons icon="play" />
        </StatusDotWrapper>
      </SidebarIconButton>
    </WithTooltip>
  ) : (
    <WithTooltip
      trigger="click"
      closeOnOutsideClick
      tooltip={
        <TooltipContent>
          <div>No code changes detected. Rerun tests to take new snapshots.</div>
          <IconButton onClick={() => startBuild()} aria-label="Rerun tests">
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
