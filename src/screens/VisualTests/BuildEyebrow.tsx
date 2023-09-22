import { Icons, Link } from "@storybook/components";
import { css, keyframes, styled } from "@storybook/theming";
import React, { useEffect, useRef } from "react";

import { BUILD_STEP_CONFIG, BUILD_STEP_ORDER } from "../../buildSteps";
import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { IconButton } from "../../components/IconButton";
import { LocalBuildProgress } from "../../types";

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(359deg)" },
});

const Header = styled.button<{ isWarning?: boolean }>(({ isWarning, onClick, theme }) => {
  const warningColor = theme.base === "dark" ? "#2e271a" : theme.background.warning;
  return {
    position: "relative",
    display: "flex",
    width: "100%",
    lineHeight: "20px",
    padding: "5px 7px 5px 15px",
    justifyContent: "space-between",
    alignItems: "center",
    background: isWarning ? warningColor : theme.background.app,
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
  };
});

const Bar = styled.div<{ isWarning?: boolean; percentage: number }>(
  ({ isWarning, percentage, theme }) => {
    const warningColor = theme.base === "dark" ? "#43361f" : "#FFE6B1";
    return {
      display: "block",
      position: "absolute",
      top: "0",
      height: "100%",
      left: "0",
      width: `${percentage}%`,
      transition: "width 3s ease-out",
      backgroundColor: isWarning ? warningColor : theme.background.hoverable,
      pointerEvents: "none",
      zIndex: 0,
    };
  }
);

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

const StepDetail = styled.div<{ isCurrent: boolean; isFailed: boolean; isPending: boolean }>(
  ({ isCurrent, isFailed, isPending, theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: 8,
    opacity: isPending ? 0.7 : 1,
    color: isFailed ? theme.color.negativeText : "inherit",
    fontWeight: isCurrent || isFailed ? "bold" : "normal",
    fontFamily: "Menlo, monospace",
    fontSize: "12px",
    lineHeight: "24px",
    margin: "0 15px",
    "&:first-of-type": {
      marginTop: 10,
    },
    "&:last-of-type": {
      marginBottom: 10,
    },
  })
);

const StepIcon = styled(Icons)(
  { width: 10, marginRight: 8 },
  ({ icon }) => icon === "sync" && css({ animation: `${spin} 1s linear infinite` })
);

type BuildProgressProps = {
  localBuildProgress: LocalBuildProgress;
  expanded?: boolean;
};

const BuildProgress = ({ localBuildProgress, expanded = false }: BuildProgressProps) => {
  const stepHistory = useRef<
    Partial<Record<LocalBuildProgress["currentStep"], LocalBuildProgress>>
  >({});

  useEffect(() => {
    stepHistory.current[localBuildProgress.currentStep] = { ...localBuildProgress };
  }, [localBuildProgress]);

  const buildFailed = ["aborted", "error"].includes(localBuildProgress.currentStep);
  const steps = BUILD_STEP_ORDER.map((step) => {
    const { startedAt, completedAt } = localBuildProgress.stepProgress[step];
    const isCurrent = !!startedAt && !completedAt;
    const isFailed = isCurrent && buildFailed;
    const isPending = !startedAt;
    const config = { ...BUILD_STEP_CONFIG[step], isCurrent, isFailed, isPending };
    if (isFailed) {
      return { ...config, icon: "failed", renderLabel: config.renderProgress };
    }
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
        {steps.map(({ icon, isCurrent, isFailed, isPending, key, renderLabel }) => (
          <StepDetail {...{ isCurrent, isFailed, isPending }} key={key}>
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
  dismissBuildError: () => void;
  localBuildProgress?: LocalBuildProgress;
  lastBuildOnBranchInProgress?: boolean;
  switchToLastBuildOnBranch?: () => void;
};

export const BuildEyebrow = ({
  branch,
  dismissBuildError,
  localBuildProgress,
  lastBuildOnBranchInProgress,
  switchToLastBuildOnBranch,
}: BuildEyebrowProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (localBuildProgress) {
    const isWarning = ["aborted", "error"].includes(localBuildProgress.currentStep);
    return (
      <>
        <Header
          as={isWarning ? "div" : "button"}
          onClick={isWarning ? undefined : toggleExpanded}
          isWarning={isWarning}
        >
          <Bar percentage={localBuildProgress.buildProgressPercentage} isWarning={isWarning} />
          <Label>
            <BuildProgressLabel localBuildProgress={localBuildProgress} withEmoji />
          </Label>
          {isWarning ? (
            <IconButton onClick={dismissBuildError}>
              <Icons icon="close" />
            </IconButton>
          ) : (
            <IconButton as="div">
              <Icons icon={expanded ? "collapse" : "expandalt"} />
            </IconButton>
          )}
        </Header>
        <BuildProgress localBuildProgress={localBuildProgress} expanded={expanded || isWarning} />
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
      return (
        <Label>
          Reviewing is disabled because there's a newer build in progress on main. This can happen
          when a build runs in CI.
        </Label>
      );
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
