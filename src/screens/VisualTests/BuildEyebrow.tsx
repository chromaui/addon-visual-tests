import { Icons } from "@storybook/components";
import React from "react";

import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { IconButton } from "../../components/IconButton";
import { RunningBuildPayload } from "../../types";
import { Bar, BuildProgress, Header } from "./BuildProgress";

type BuildEyebrowProps = {
  runningBuild?: RunningBuildPayload;
  switchToNextBuild?: () => void;
};

export function BuildEyebrow({ runningBuild, switchToNextBuild }: BuildEyebrowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (runningBuild) {
    return (
      <>
        <Header onClick={toggleExpanded}>
          <Bar percentage={runningBuild.buildProgressPercentage} />
          <BuildProgressLabel runningBuild={runningBuild} />
          <IconButton as="div">
            {expanded ? <Icons icon="collapse" /> : <Icons icon="expandalt" />}
          </IconButton>
        </Header>
        <BuildProgress buildProgress={runningBuild} expanded={expanded} />
      </>
    );
  }

  const message = switchToNextBuild
    ? "There's a newer snapshot with changes"
    : "Reviewing is disabled because there's a newer snapshot on <branch>";

  return (
    <Header>
      <Bar percentage={100} />
      {message}
    </Header>
  );
}
