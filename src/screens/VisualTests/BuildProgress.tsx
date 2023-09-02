import { Button } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { RunningBuildPayload } from "../../constants";
import { NextBuildFieldsFragment } from "../../gql/graphql";

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
  runningBuild?: RunningBuildPayload;
  nextBuild?: NextBuildFieldsFragment;
  switchToNextBuild: () => void;
};

const messageMap: Record<RunningBuildPayload["step"], string> = {
  initialize: "📦 Validating Storybook files...",
  build: "📦 Validating Storybook files...",
  upload: "📡 Uploading to Chromatic...", // TODO represent progress in bytes
  verify: "🛠️ Initiating build...", // TODO build number
  snapshot: "👀 Running visual tests...", // TODO count
  complete: "🎉 Visual tests completed!",
};

export function BuildProgress({ runningBuild, nextBuild, switchToNextBuild }: BuildProgressProps) {
  const percentage = (runningBuild.total ? runningBuild.progress / runningBuild.total : 0.35) * 100;

  // We show the "go to next build" button if there's no build running or if the running build is complete
  const showButton = !runningBuild || runningBuild.step === "complete";
  return (
    <Header>
      <Bar percentage={percentage}>&nbsp;</Bar>
      <Text>
        {messageMap[runningBuild.step]}{" "}
        {showButton && <Button onClick={switchToNextBuild}>Switch to next build</Button>}
      </Text>
    </Header>
  );
}
