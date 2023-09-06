import { Icon } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React from "react";

import { BuildProgressPayload } from "../../constants";

export const Header = styled.div(({ theme }) => ({
  display: "flex", // <--- Add this line
  justifyContent: "space-between", // <--- Add this line
  cursor: "pointer",
  color: theme.color.darkest,
  background: theme.background.app,
  borderBottom: `1px solid ${theme.appBorderColor}`,
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
}));

export const Bar = styled.div<{ percentage: number }>(({ theme, percentage }) => ({
  display: "block",
  position: "absolute",
  top: "0",
  height: "100%",
  left: "0",
  width: `${percentage}%`,
  transition: "all 150ms ease-out",
  backgroundColor: "#E3F3FF",
}));

export const Text = styled.div({
  position: "relative",
  zIndex: 1,
});

const ExpandableDiv = styled.div<{ expanded: boolean }>(({ expanded, theme }) => ({
  height: expanded ? "151px" : "0",
  padding: expanded ? "15px 11px" : 0,
  overflow: "hidden",
  transition: "height 150ms ease-out",
  background: theme.background.app,
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));

const StepDetail = styled.div<{ isCurrent: boolean }>`
  display: flex;
  justify-content: space-between;
  font-weight: ${(props) => (props.isCurrent ? "bold" : "normal")};
  font-family: Menlo, monospace;
  font-size: 12px;
  line-height: 24px;
  // ... styles
`;

const Progress = styled.div`
  // ... styles
`;

const StepName = styled.div`
  align-self: left;
  // ... other styles
`;

const Status = styled.div`
  // ... styles
`;

function ProgressSummary({
  expanded = false,
  children,
}: {
  expanded: boolean;
  children?: React.ReactNode;
}) {
  return <ExpandableDiv expanded={expanded}>{children}</ExpandableDiv>;
}

type BuildProgressProps = {
  buildProgress: BuildProgressPayload;
};

// Need to actually create an store an array of stepHistory objects on step completion. Fields may change.
type StepHistory = {
  timeToComplete: number;
  total: number;
};
// Weight to take a percentage of the progress bar
// Using an array to preserve order
const stepsArray: Array<{
  step: BuildProgressPayload["step"];
  displayName?: string;
  weight: number;
  message: (payload: BuildProgressPayload) => string;
  statusInProgress?: (payload: BuildProgressPayload) => string;
  // Completed should accept a stepHistory object but not made yet
  statusCompleted: (stepHistory?: StepHistory) => string;
}> = [
    {
      step: "initialize",
      weight: 0,
      message: () => `📦 Validating Storybook files...`,
      displayName: "Initialize",
      statusInProgress: () => "Inititalizing",
      statusCompleted: () => "Initialized", // Need stepHistory to know how long it took
    },
    {
      step: "build",
      weight: 40,
      message: () => `📦 Validating Storybook files...`,
      displayName: "Build Storybook",
      statusInProgress: () => "Building...",
      statusCompleted: () => "Built", // Need stepHistory to know how long it took
    },
    {
      step: "upload",
      weight: 10,
      message: (payload) => `📡 Uploading to Chromatic ${payload.progress}/${payload.total}...`,
      displayName: "Publish Storybook",
      statusInProgress: () => "Publishing...",
      statusCompleted: () => "Published", // Need stepHistory to know how long it took
    },
    {
      step: "verify",
      weight: 10,
      message: () => `🛠️ Initiating build`,
      displayName: "Verify Storynook",
      statusInProgress: () => "Verifying...",
      statusCompleted: () => "Verified", // Need stepHistory to know how long it took
    },
    {
      step: "snapshot",
      weight: 40,
      message: (payload) => `👀 Running visual test ${payload.progress}/${payload.total}...`,
      displayName: "Run visual tests",
      statusInProgress: (progress) => `${progress.progress}/${progress.total}`,
      statusCompleted: () => `Uploaded`, // Need stepHistory to know how many completed
    },
    {
      step: "complete",
      weight: 0,
      message: () => "🎉 Visual tests completed!",
      displayName: "Completed",
      statusInProgress: () => "Completed",
      statusCompleted: () => "Completed",
    },
  ];

const totalWeight = stepsArray.reduce((acc, { weight }) => acc + weight, 0);

export function BuildProgress({ buildProgress }: BuildProgressProps) {
  const { step } = buildProgress;

  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // This shouldn't happen, but it does because of an issue in the onTaskProgress callback returning undefined for newSteps between initialize and snapshot
  if (!step) {
    console.log("buildProgress.step is undefined", buildProgress);
    return null;
  }

  const stepIndex = stepsArray.findIndex((s) => s.step === step);
  const currentStep = stepsArray[stepIndex];
  const previousStepsWeight = stepsArray.slice(0, stepIndex).reduce<number>((acc, s) => {
    return acc + s.weight;
  }, 0);
  const previousStepsPercentage = previousStepsWeight / totalWeight; // 0.xx

  // Calculate the percentage of the current step if progress is available, otherwise default to 35%
  const percentage =
    (buildProgress.total ? buildProgress.progress / buildProgress.total : 0.35) *
    (currentStep.weight / totalWeight);

  const totalPercentage = previousStepsPercentage + percentage;
  // This shouldn't happen, but it does because of an issue in the onTaskProgress callback returning undefined for newSteps between initialize and snapshot
  if (!buildProgress.step) {
    console.log("buildProgress.step is undefined", buildProgress);
    return null;
  }

  return (
    <>
      <Header onClick={toggleExpanded}>
        <Bar percentage={totalPercentage * 100}>&nbsp;</Bar>
        <Text style={{ display: "inline-block" }}>{currentStep.message(buildProgress)}</Text>
        {expanded ? <Icon icon="collapse" /> : <Icon icon="expandalt" />}
      </Header>
      <ProgressSummary expanded={expanded}>
        {stepsArray.slice(0, stepsArray.length - 1).map((stepDetail, index) => (
          <StepDetail isCurrent={stepDetail.step === buildProgress.step} key={index}>
            <div style={{ display: "flex" }}>
              {stepDetail.step === buildProgress.step && (
                <Progress>[{Math.trunc(percentage * 100)}% ]</Progress>
              )}
              {index < stepIndex && <Progress> [100%]</Progress>}
              {index > stepIndex && <Progress>[0% ]</Progress>}
              <StepName>{stepDetail.displayName}</StepName>
            </div>
            <Status>
              {/* {step.timeToComplete ? `Completed in ${step.timeToComplete}s` : step.status} */}
              {stepDetail.step === buildProgress.step && stepDetail.statusInProgress(buildProgress)}
              {index < stepIndex && <Progress>{stepDetail.statusCompleted()}</Progress>}
              {index > stepIndex && <Progress>Not started</Progress>}
            </Status>
          </StepDetail>
        ))}
      </ProgressSummary>
    </>
  );
}
