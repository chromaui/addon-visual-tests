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

const messageMap: Record<BuildProgressPayload["step"], (payload: BuildProgressPayload) => string> =
  {
    initialize: () => `📦 Validating Storybook files...`,
    build: () => `📦 Validating Storybook files...`,
    upload: (payload) => `📡 Uploading to Chromatic ${payload.progress}/${payload.total}...`, // TODO represent progress in bytes
    verify: () => `🛠️ Initiating build`, // TODO build number
    snapshot: (payload) => `👀 Running visual test ${payload.progress}/${payload.total}...`, // TODO count
    complete: () => "🎉 Visual tests completed!",
  };
// TODO: In the design, we have a starting state, a progress state, and a completed state for each step. For now, we only have the progress state. https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-373686&mode=design&t=9s23AuWqjDaCTdXg-4

// Weight to take a percentage of the progress bar
// Using an array to preserve order
const stepWeightArray = [
  { step: "initialize", weight: 0 },
  { step: "build", weight: 40 },
  { step: "upload", weight: 10 },
  { step: "verify", weight: 10 },
  { step: "snapshot", weight: 40 },
  { step: "complete", weight: 0 },
];

const totalWeight = stepWeightArray.reduce((acc, { weight }) => acc + weight, 0);

export function BuildProgress({ buildProgress }: BuildProgressProps) {
  const { step } = buildProgress;
  const stepWeight = stepWeightArray.find((s) => s.step === step)?.weight;
  const stepIndex = stepWeightArray.findIndex((s) => s.step === step);
  const previousStepsWeight = stepWeightArray.slice(0, stepIndex).reduce<number>((acc, s) => {
    return acc + s.weight;
  }, 0);
  const previousStepsPercentage = previousStepsWeight / totalWeight; // 0.xx
  const percentage =
    (buildProgress.total ? buildProgress.progress / buildProgress.total : 0.35) *
    (stepWeight / totalWeight);

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
