import { Icons } from "@storybook/components";
import { css, keyframes, styled } from "@storybook/theming";
import React, { useEffect, useRef } from "react";

import { BUILD_STEP_CONFIG, BUILD_STEP_ORDER } from "../../buildSteps";
import { RunningBuildPayload } from "../../types";

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(359deg)" },
});

export const Header = styled.button(({ theme }) => ({
  position: "relative",
  display: "flex",
  width: "100%",
  minHeight: 40,
  padding: "5px 5px 5px 10px",
  justifyContent: "space-between",
  alignItems: "center",
  background: theme.background.app,
  border: "none",
  borderBottom: `1px solid ${theme.appBorderColor}`,
  color: theme.color.defaultText,
  cursor: "pointer",
  textAlign: "left",
}));

export const Bar = styled.div<{ percentage: number }>(({ theme, percentage }) => ({
  display: "block",
  position: "absolute",
  top: "0",
  height: "100%",
  left: "0",
  width: `${percentage}%`,
  transition: "all 150ms ease-out",
  backgroundColor: theme.background.hoverable,
}));

const ExpandableDiv = styled.div<{ expanded: boolean }>(({ expanded, theme }) => ({
  overflow: "hidden",
  background: theme.background.app,
  transition: "max-height 150ms ease-out",
  maxHeight: expanded ? 140 : 0,
  borderBottom: expanded ? `1px solid ${theme.appBorderColor}` : "none",
}));

const StepDetails = styled.div({
  padding: 10,
  whiteSpace: "nowrap",
});

const StepDetail = styled.div<{ isCurrent: boolean; isPending: boolean }>(
  ({ isCurrent, isPending }) => ({
    display: "flex",
    flexDirection: "row",
    gap: 8,
    opacity: isPending ? 0.7 : 1,
    fontWeight: isCurrent ? "bold" : "normal",
    fontFamily: "Menlo, monospace",
    fontSize: "12px",
    lineHeight: "24px",
  })
);

const StepIcon = styled(Icons)(
  { width: 10, marginRight: 8 },
  ({ icon }) => icon === "sync" && css({ animation: `${spin} 1s linear infinite` })
);

type BuildProgressProps = {
  buildProgress?: RunningBuildPayload;
  expanded?: boolean;
};

// Need to actually create an store an array of stepHistory objects on step completion. Fields may change.
type StepHistory = {
  timeToComplete: number;
  total: number;
};

export function BuildProgress({ buildProgress, expanded }: BuildProgressProps) {
  const stepHistory = useRef<Partial<Record<RunningBuildPayload["step"], RunningBuildPayload>>>({});

  useEffect(() => {
    stepHistory.current[buildProgress.step] = { ...buildProgress };
  }, [buildProgress]);

  const currentIndex = BUILD_STEP_ORDER.findIndex((key) => key === buildProgress.step);

  // This shouldn't happen, but it does because of an issue in the onTaskProgress callback returning
  // undefined for newSteps between initialize and snapshot
  if (currentIndex === -1) {
    console.log("buildProgress.step is undefined or not supported", buildProgress);
    return null;
  }

  const steps = BUILD_STEP_ORDER.map((step, index) => {
    const config = {
      ...BUILD_STEP_CONFIG[step],
      isCurrent: index === currentIndex,
      isPending: index > currentIndex,
    };
    if (index > currentIndex) {
      return { ...config, icon: "arrowright", renderLabel: config.renderName };
    }
    if (index < currentIndex) {
      return { ...config, icon: "check", renderLabel: config.renderComplete };
    }
    return { ...config, icon: "sync", renderLabel: config.renderProgress };
  });

  return (
    <ExpandableDiv expanded={expanded}>
      <StepDetails>
        {steps.map(({ icon, isCurrent, isPending, key, renderLabel }) => (
          <StepDetail isCurrent={isCurrent} isPending={isPending} key={key}>
            <div>
              <StepIcon icon={icon as any} />
              {renderLabel(stepHistory.current[key] || buildProgress)}
            </div>
          </StepDetail>
        ))}
      </StepDetails>
    </ExpandableDiv>
  );
}
