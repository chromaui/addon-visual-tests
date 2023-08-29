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

const messageMap: Record<BuildProgressPayload["step"], string> = {
  initialize: "📦 Validating Storybook files...",
  build: "📦 Validating Storybook files...",
  upload: "📡 Uploading to Chromatic...", // TODO represent progress in bytes
  verify: "🛠️ Initiating build...", // TODO build number
  snapshot: "👀 Running visual tests...", // TODO count
  complete: "🎉 Visual tests completed!",
};

export function BuildProgress({ buildProgress }: BuildProgressProps) {
  const percentage =
    (buildProgress.total ? buildProgress.progress / buildProgress.total : 0.35) * 100;

  return (
    <Header>
      <Bar percentage={percentage}>&nbsp;</Bar>
      <Text>{messageMap[buildProgress.step]}</Text>
    </Header>
  );
}
