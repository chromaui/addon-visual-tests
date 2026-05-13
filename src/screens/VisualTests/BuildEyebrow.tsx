import {
  CheckIcon,
  ChevronRightIcon,
  ChevronSmallDownIcon,
  CloseIcon,
  FailedIcon,
  SyncIcon,
} from '@storybook/icons';
import React, { useEffect, useRef } from 'react';
import { ActionList, Link } from 'storybook/internal/components';
import { keyframes, styled } from 'storybook/theming';

import { BUILD_STEP_CONFIG, BUILD_STEP_ORDER } from '../../buildSteps';
import { BuildProgressLabel } from '../../components/BuildProgressLabel';
import { Code } from '../../components/Code';
import { LocalBuildProgress } from '../../types';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(359deg)' },
});

const SpinIcon = styled(SyncIcon)({
  animation: `${spin} 1s linear infinite`,
});

const stepIconStyle = { width: 10, marginRight: 8 };

const Header = styled.div<{ isWarning?: boolean }>(({ isWarning, onClick, theme }) => {
  const warningColor = theme.base === 'light' ? theme.background.warning : '#2e271a';
  return {
    position: 'relative',
    display: 'flex',
    width: '100%',
    lineHeight: '20px',
    padding: '5px 7px 5px 15px',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: isWarning ? warningColor : theme.background.app,
    border: 'none',
    borderBottom: `1px solid ${theme.appBorderColor}`,
    color: theme.color.defaultText,
    cursor: onClick ? 'pointer' : 'default',
    textAlign: 'left',

    '& > *': {
      zIndex: 1,
    },

    code: {
      fontFamily: theme.typography.fonts.mono,
      fontSize: '12px',
    },
  };
});

const Bar = styled.div<{ isWarning?: boolean; percentage: number }>(
  ({ isWarning, percentage, theme }) => {
    const warningColor = theme.base === 'light' ? '#FFE6B1' : '#43361f';
    return {
      display: 'block',
      position: 'absolute',
      top: '0',
      height: '100%',
      left: '0',
      width: `${percentage}%`,
      transition: 'width 3s ease-out',
      backgroundColor: isWarning ? warningColor : theme.background.hoverable,
      pointerEvents: 'none',
      zIndex: 0,
    };
  }
);

const Label = styled.div({
  lineHeight: '21px',
  padding: '4px 0',
});

const ToggleIcon = styled(ChevronSmallDownIcon)({
  transition: 'transform 0.1s ease-in-out',
});

const ExpandableDiv = styled.div<{ expanded: boolean }>(({ expanded, theme }) => ({
  display: 'grid',
  gridTemplateRows: expanded ? '1fr' : '0fr',
  background: theme.background.app,
  borderBottom: expanded ? `1px solid ${theme.appBorderColor}` : 'none',
  transition: 'grid-template-rows 150ms ease-out',
}));

const StepDetails = styled.div(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  color: theme.base === 'light' ? theme.color.dark : theme.color.lightest,
}));

const StepDetail = styled.div<{ isCurrent: boolean; isFailed: boolean; isPending: boolean }>(
  ({ isCurrent, isFailed, isPending, theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    opacity: isPending ? 0.7 : 1,
    color: isFailed ? theme.color.negativeText : 'inherit',
    fontWeight: isCurrent || isFailed ? 'bold' : 'normal',
    fontFamily: 'Menlo, monospace',
    fontSize: 12,
    lineHeight: '24px',
    margin: '0 15px',
    '&:first-of-type': {
      marginTop: 10,
    },
    '&:last-of-type': {
      marginBottom: 10,
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
    },
  })
);

type BuildProgressProps = {
  localBuildProgress: LocalBuildProgress;
  expanded?: boolean;
};

const BuildProgress = ({ localBuildProgress, expanded = false }: BuildProgressProps) => {
  const stepHistory = useRef<
    Partial<Record<LocalBuildProgress['currentStep'], LocalBuildProgress>>
  >({});

  useEffect(() => {
    stepHistory.current[localBuildProgress.currentStep] = { ...localBuildProgress };
  }, [localBuildProgress]);

  const buildFailed = ['aborted', 'error'].includes(localBuildProgress.currentStep);
  const steps = BUILD_STEP_ORDER.map((step) => {
    const { startedAt, completedAt } = localBuildProgress.stepProgress[step];
    const isCurrent = !!startedAt && !completedAt;
    const isFailed = isCurrent && buildFailed;
    const isPending = !startedAt;
    const config = { ...BUILD_STEP_CONFIG[step], isCurrent, isFailed, isPending };
    if (isFailed) {
      return {
        ...config,
        icon: <FailedIcon style={stepIconStyle} />,
        renderLabel: config.renderProgress,
      };
    }
    if (isCurrent) {
      return {
        ...config,
        icon: <SpinIcon style={stepIconStyle} />,
        renderLabel: config.renderProgress,
      };
    }
    if (isPending) {
      return {
        ...config,
        icon: <ChevronRightIcon style={stepIconStyle} />,
        renderLabel: config.renderName,
      };
    }
    return {
      ...config,
      icon: <CheckIcon style={stepIconStyle} />,
      renderLabel: config.renderComplete,
    };
  });

  return (
    <ExpandableDiv expanded={expanded}>
      <StepDetails>
        {steps.map(({ icon, isCurrent, isFailed, isPending, key, renderLabel }) => (
          <StepDetail {...{ isCurrent, isFailed, isPending }} key={key}>
            <div>
              {icon}
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
    const aborted = localBuildProgress.currentStep === 'aborted';
    const errored = localBuildProgress.currentStep === 'error';
    const isWarning = aborted || errored;
    return (
      <>
        <Header onClick={errored ? undefined : toggleExpanded} isWarning={isWarning}>
          <Bar percentage={localBuildProgress.buildProgressPercentage} isWarning={isWarning} />
          <Label>
            <BuildProgressLabel localBuildProgress={localBuildProgress} withEmoji />
          </Label>
          {errored ? (
            <ActionList.Button ariaLabel="Dismiss" onClick={dismissBuildError} size="small">
              <CloseIcon />
            </ActionList.Button>
          ) : (
            <ActionList.Button
              ariaLabel={`${expanded ? 'Collapse' : 'Expand'} build progress`}
              onClick={errored ? undefined : toggleExpanded}
              size="small"
            >
              <ToggleIcon style={{ transform: `rotate(${expanded ? -180 : 0}deg)` }} />
            </ActionList.Button>
          )}
        </Header>
        <BuildProgress localBuildProgress={localBuildProgress} expanded={expanded || errored} />
      </>
    );
  }

  function nextBuildMessage() {
    if (!switchToLastBuildOnBranch) {
      return (
        <Label>
          Reviewing is disabled because there&apos;s a newer build on <Code>{branch}</Code>.
        </Label>
      );
    }
    if (lastBuildOnBranchInProgress) {
      return (
        <Label>
          Reviewing is disabled because there&apos;s a newer build in progress on{' '}
          <Code>{branch}</Code>. This can happen when a build runs in CI.
        </Label>
      );
    }
    return (
      <Label>
        There's a newer snapshot with changes.{' '}
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
