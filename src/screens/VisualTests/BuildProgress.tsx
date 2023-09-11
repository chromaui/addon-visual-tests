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
  transition: "width 3s ease-out",
  backgroundColor: theme.background.hoverable,
}));

const ExpandableDiv = styled.div<{ expanded: boolean }>(({ expanded, theme }) => ({
  display: "grid",
  gridTemplateRows: expanded ? "1fr" : "0fr",
  background: theme.background.app,
  borderBottom: expanded ? `1px solid ${theme.appBorderColor}` : "none",
  transition: "grid-template-rows 150ms ease-out",
}));

const StepDetails = styled.div({
  whiteSpace: "nowrap",
  overflow: "hidden",
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
    margin: "0 10px",
    "&:first-of-type": {
      marginTop: 8,
    },
    "&:last-of-type": {
      marginBottom: 8,
    },
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

export function BuildProgress({ buildProgress, expanded }: BuildProgressProps) {
  const stepHistory = useRef<
    Partial<Record<RunningBuildPayload["currentStep"], RunningBuildPayload>>
  >({});

  useEffect(() => {
    stepHistory.current[buildProgress.currentStep] = { ...buildProgress };
  }, [buildProgress]);

  const currentIndex = BUILD_STEP_ORDER.findIndex((key) => key === buildProgress.currentStep);

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
