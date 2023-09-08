import React from "react";

import { RunningBuildPayload } from "../../constants";
import { Bar, BuildProgress, Header, Text } from "./BuildProgress";

type BuildEyebrowProps = {
  runningBuild?: RunningBuildPayload;
  switchToNextBuild?: () => void;
};

export function BuildEyebrow({ runningBuild, switchToNextBuild }: BuildEyebrowProps) {
  if (runningBuild) {
    return <BuildProgress buildProgress={runningBuild} />;
  }

  const message = switchToNextBuild
    ? "There's a newer snapshot with changes"
    : "Reviewing is disabled because there's a newer snapshot on <branch>";

  return (
    <Header>
      <Bar percentage={100}>&nbsp;</Bar>
      <Text style={{ display: "inline-block" }}>{message}</Text>
    </Header>
  );
}
