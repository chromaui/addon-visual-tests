import { styled } from "@storybook/theming";
import React from "react";

import { BuildProgressPayload } from "../../constants";

export const Header = styled.div(({ theme }) => ({
  color: theme.color.darkest,
  background: theme.background.app,
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

type BuildProgressProps = {
  buildProgress: BuildProgressPayload;
};

// Weight to take a percentage of the progress bar
// Using an array to preserve order
const stepsArray: Array<{
  step: BuildProgressPayload["step"];
  weight: number;
  message: (payload: BuildProgressPayload) => string;
}> = [
    { step: "initialize", weight: 0, message: () => `📦 Validating Storybook files...` },
    { step: "build", weight: 40, message: () => `📦 Validating Storybook files...` },
    {
      step: "upload",
      weight: 10,
      message: (payload) => `📡 Uploading to Chromatic ${payload.progress}/${payload.total}...`,
    },
    { step: "verify", weight: 10, message: () => `🛠️ Initiating build` },
    {
      step: "snapshot",
      weight: 40,
      message: (payload) => `👀 Running visual test ${payload.progress}/${payload.total}...`,
    },
    { step: "complete", weight: 0, message: () => "🎉 Visual tests completed!" },
  ];
// TODO: In the design, we have a starting state, a progress state, and a completed state for each step. For now, we only have the progress state. https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-373686&mode=design&t=9s23AuWqjDaCTdXg-4Z3ZQ

const totalWeight = stepsArray.reduce((acc, { weight }) => acc + weight, 0);

export function BuildProgress({ buildProgress }: BuildProgressProps) {
  const { step } = buildProgress;

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

    (buildProgress.total ? buildProgress.progress / buildProgress.total : 0.35) * 100;

  // This shouldn't happen, but it does because of an issue in the onTaskProgress callback returning undefined for newSteps between initialize and snapshot
  if (!buildProgress.step) {
    console.log("buildProgress.step is undefined", buildProgress);
    return null;
  }
  return (
    <Header>
      <Bar percentage={totalPercentage * 100}>&nbsp;</Bar>
      <Text>{messageMap[buildProgress.step](buildProgress)}</Text>
    </Header>
  );
}
