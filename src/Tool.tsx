import { Bar, IconButton, Icons, Loader, WithTooltip } from "@storybook/components";
import { useChannel, useStorybookApi } from "@storybook/manager-api";
import { color, styled } from "@storybook/theming";
import pluralize from "pluralize";
import React, { ComponentProps, useEffect, useRef } from "react";

import { BuildProgressLabel } from "./components/BuildProgressLabel";
import { ADDON_ID, RUNNING_BUILD, RunningBuildPayload, START_BUILD } from "./constants";
import { useAddonState } from "./useAddonState/manager";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

const TooltipContent = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 5,
  minWidth: 200,
  padding: 10,
  color: theme.color.defaultText,
}));

const ProgressTrack = styled.div(({ theme }) => ({
  height: 5,
  background: theme.background.hoverable,
  borderRadius: 1,
}));
const ProgressBar = styled(ProgressTrack)(({ theme }) => ({
  background: theme.color.secondary,
}));

const SidebarIconButton = styled(IconButton)<ComponentProps<typeof IconButton>>(({ theme }) => ({
  position: "relative",
  overflow: "visible",
  color: theme.textMutedColor,
  marginTop: 0,
  zIndex: 1,
}));

const ProgressCircle = styled.svg(({ theme }) => ({
  position: "absolute",
  width: `24px!important`,
  height: `24px!important`,
  transform: "rotate(-90deg)",
  color: theme.color.secondary,
}));

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

  return <ToolContent isRunning={isRunning} runningBuild={runningBuild} startBuild={startBuild} />;
};

export const ToolContent = ({
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
