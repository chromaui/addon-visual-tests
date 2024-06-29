import { WithTooltip } from "@storybook/components";
import { PlayIcon, StopAltIcon } from "@storybook/icons";
import { keyframes, styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { LocalBuildProgress } from "../types";
import { BuildProgressLabel } from "./BuildProgressLabel";
import { jiggle } from "./design-system/shared/animation";
import { IconButton } from "./IconButton";
import { StatusDotWrapper } from "./StatusDot";
import { TooltipNote } from "./TooltipNote";

export const TooltipContent = styled.div(({ theme }) => ({
  width: 220,
  padding: 3,
  color: theme.base === "light" ? theme.color.defaultText : theme.color.light,

  "& > div": {
    margin: 7,
  },
}));

export const ProgressTrack = styled.div(({ theme }) => ({
  height: 5,
  background: theme.background.hoverable,
  borderRadius: 5,
  overflow: "hidden",
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

const WarningText = styled.div(({ theme }) => ({
  color: theme.color.warningText,
  "&&": { marginTop: 10 },
}));

export const SidebarIconButton = styled(IconButton)<
  ComponentProps<typeof IconButton> & { isDisallowed?: boolean }
>(({ isDisallowed, theme }) => ({
  position: "relative",
  overflow: "visible",
  color: theme.textMutedColor,
  marginTop: 0,
  zIndex: 1,
  marginRight: 4,
  ...(isDisallowed && {
    animation: `${jiggle} 700ms ease-out`,
  }),
}));

export const SidebarTopButton = ({
  isDisabled = false,
  isDisallowed = false,
  isOutdated = false,
  isRunning = false,
  localBuildProgress,
  warning,
  clickWarning,
  startBuild,
  stopBuild,
}: {
  isDisabled?: boolean;
  isDisallowed?: boolean;
  isOutdated?: boolean;
  isRunning?: boolean;
  localBuildProgress?: LocalBuildProgress;
  warning?: string;
  clickWarning?: () => void;
  startBuild: () => void;
  stopBuild: () => void;
}) => {
  if (isDisabled) {
    return warning ? (
      <WithTooltip tooltip={<TooltipNote note={warning} />} trigger="hover" hasChrome={false}>
        <SidebarIconButton
          id="button-run-tests"
          aria-label="Visual Tests locked"
          disabled={!clickWarning}
          onClick={clickWarning}
        >
          <StatusDotWrapper status="warning">
            <PlayIcon />
          </StatusDotWrapper>
        </SidebarIconButton>
      </WithTooltip>
    ) : (
      <SidebarIconButton id="button-run-tests" aria-label="Visual Tests locked" disabled>
        <PlayIcon />
      </SidebarIconButton>
    );
  }

  if (isRunning && localBuildProgress) {
    const { buildProgressPercentage } = localBuildProgress;
    return (
      <WithTooltip
        trigger="hover"
        tooltip={
          <TooltipContent>
            <div>
              <BuildProgressLabel localBuildProgress={localBuildProgress} small withEmoji />
            </div>
            <ProgressTrack>
              {typeof buildProgressPercentage === "number" && (
                <ProgressBar style={{ width: `${buildProgressPercentage}%` }} />
              )}
            </ProgressTrack>
            {isDisallowed && (
              <WarningText>
                This job has already reached the capture cloud and cannot be stopped locally.
              </WarningText>
            )}
          </TooltipContent>
        }
      >
        <SidebarIconButton
          aria-label="Stop tests"
          isDisallowed={isDisallowed}
          onClick={() => stopBuild()}
        >
          <StopAltIcon style={{ width: 10, margin: 2 }} />
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

  if (isOutdated) {
    return (
      <WithTooltip
        tooltip={<TooltipNote note="Code changes detected; click to run tests" />}
        trigger="hover"
        hasChrome={false}
      >
        <SidebarIconButton
          id="button-run-tests"
          aria-label="Run tests"
          onClick={() => startBuild()}
        >
          <StatusDotWrapper status="notification">
            <PlayIcon />
          </StatusDotWrapper>
        </SidebarIconButton>
      </WithTooltip>
    );
  }

  return (
    <WithTooltip
      trigger="hover"
      hasChrome={false}
      tooltip={<TooltipNote note="No code changes detected. Rerun tests to take new snapshots." />}
    >
      <SidebarIconButton id="button-run-tests" aria-label="Run tests" onClick={() => startBuild()}>
        <PlayIcon />
      </SidebarIconButton>
    </WithTooltip>
  );
};
