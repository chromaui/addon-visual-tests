import { Icons, Link } from "@storybook/components";
import React from "react";

import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { RunningBuildPayload } from "../../types";
import { Bar, BuildProgress, Header } from "./BuildProgress";

type BuildEyebrowProps = {
  branch: string;
  runningBuild?: RunningBuildPayload;
  switchToNextBuild?: () => void;
};

export function BuildEyebrow({ branch, runningBuild, switchToNextBuild }: BuildEyebrowProps) {
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

  const message = switchToNextBuild ? (
    <span>
      There's a newer snapshot with changes.
      {" " /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link withArrow>Switch to newer snapshot</Link>
    </span>
  ) : (
    <span>
      Reviewing is disabled because there's a newer build on <code>{branch}</code>.
    </span>
  );

  return (
    <Header onClick={switchToNextBuild}>
      <Bar percentage={100} />
      {message}
    </Header>
  );
}
