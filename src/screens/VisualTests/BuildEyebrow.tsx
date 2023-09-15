import { Icons, Link } from "@storybook/components";
import { css, keyframes, styled } from "@storybook/theming";
import React, { useEffect, useRef } from "react";

import { BUILD_STEP_CONFIG, BUILD_STEP_ORDER } from "../../buildSteps";
import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { IconButton } from "../../components/IconButton";
import { LocalBuildProgressPayload } from "../../types";

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(359deg)" },
});

const Header = styled.button(({ onClick, theme }) => ({
  position: "relative",
  display: "flex",
  width: "100%",
  lineHeight: "20px",
  padding: "5px 5px 5px 15px",
  justifyContent: "space-between",
  alignItems: "center",
  background: theme.background.app,
  border: "none",
  borderBottom: `1px solid ${theme.appBorderColor}`,
  color: theme.color.defaultText,
  cursor: onClick ? "pointer" : "default",
  textAlign: "left",

  "& > *": {
    zIndex: 1,
  },

  code: {
    fontFamily: theme.typography.fonts.mono,
    fontSize: theme.typography.size.s1,
  },
}));

const Bar = styled.div<{ percentage: number }>(({ theme, percentage }) => ({
  display: "block",
  position: "absolute",
  top: "0",
  height: "100%",
  left: "0",
  width: `${percentage}%`,
  transition: "width 3s ease-out",
  backgroundColor: theme.background.hoverable,
  pointerEvents: "none",
  zIndex: 0,
}));

const Label = styled.div({
  padding: "5px 0",
});

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
  localBuildProgress?: LocalBuildProgressPayload;
  expanded?: boolean;
};

const BuildProgress = ({ localBuildProgress, expanded }: BuildProgressProps) => {
  const stepHistory = useRef<
    Partial<Record<LocalBuildProgressPayload["currentStep"], LocalBuildProgressPayload>>
  >({});

  useEffect(() => {
    stepHistory.current[localBuildProgress.currentStep] = { ...localBuildProgress };
  }, [localBuildProgress]);

  const currentIndex = BUILD_STEP_ORDER.findIndex((key) => key === localBuildProgress.currentStep);
  const steps = BUILD_STEP_ORDER.map((step, index) => {
    const isCurrent = index === currentIndex;
    const isPending = index > currentIndex && currentIndex !== -1;
    const config = { ...BUILD_STEP_CONFIG[step], isCurrent, isPending };
    if (isCurrent) {
      return { ...config, icon: "sync", renderLabel: config.renderProgress };
    }
    if (isPending) {
      return { ...config, icon: "arrowright", renderLabel: config.renderName };
    }
    return { ...config, icon: "check", renderLabel: config.renderComplete };
  });

  return (
    <ExpandableDiv expanded={expanded}>
      <StepDetails>
        {steps.map(({ icon, isCurrent, isPending, key, renderLabel }) => (
          <StepDetail isCurrent={isCurrent} isPending={isPending} key={key}>
            <div>
              <StepIcon icon={icon as any} />
              {renderLabel(stepHistory.current[key] || localBuildProgress)}
            </div>
          </StepDetail>
        ))}
      </StepDetails>
    </ExpandableDiv>
  );
};

type BuildEyebrowProps = {
  branch: string;
  localBuildProgress?: LocalBuildProgressPayload;
  lastBuildOnBranchInProgress?: boolean;
  switchToLastBuildOnBranch?: () => void;
};

export const BuildEyebrow = ({
  branch,
  localBuildProgress,
  lastBuildOnBranchInProgress,
  switchToLastBuildOnBranch,
}: BuildEyebrowProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (localBuildProgress) {
    return (
      <>
        <Header onClick={toggleExpanded}>
          <Bar percentage={localBuildProgress.buildProgressPercentage} />
          <Label>
            <BuildProgressLabel localBuildProgress={localBuildProgress} />
          </Label>
          <IconButton as="div">
            {expanded ? <Icons icon="collapse" /> : <Icons icon="expandalt" />}
          </IconButton>
        </Header>
        <BuildProgress localBuildProgress={localBuildProgress} expanded={expanded} />
      </>
    );
  }

  function nextBuildMessage() {
    if (!switchToLastBuildOnBranch) {
      return (
        <Label>
          Reviewing is disabled because there's a newer build on <code>{branch}</code>.
        </Label>
      );
    }
    if (lastBuildOnBranchInProgress) {
      return "⚠️ Reviewing is disabled because there's a newer build in progress on main. This can happen when a build runs in CI.";
    }
    return (
      <Label>
        There's a newer snapshot with changes.
        {" " /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link withArrow onClick={switchToLastBuildOnBranch}>
          Switch to newer snapshot
        </Link>
      </Label>
    );
  }

  return (
    <Header onClick={switchToLastBuildOnBranch}>
      <Bar percentage={100} />
      {nextBuildMessage()}
    </Header>
  );
};
