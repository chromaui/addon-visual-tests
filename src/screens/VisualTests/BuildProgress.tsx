import { Link } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { BuildProgressLabel } from "../../components/BuildProgressLabel";
import { RunningBuildPayload } from "../../constants";

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
  backgroundColor: theme.background.hoverable,
}));

export const Text = styled.div({
  position: "relative",
  zIndex: 1,
});

type BuildProgressProps = {
  runningBuild?: RunningBuildPayload;
  switchToNextBuild?: () => void;
};

export function BuildProgress({ runningBuild, switchToNextBuild }: BuildProgressProps) {
  const percentage = runningBuild?.buildProgressPercentage;

  // eslint-disable-next-line no-nested-ternary
  const text = runningBuild ? (
    <BuildProgressLabel runningBuild={runningBuild} />
  ) : switchToNextBuild ? (
    "There's a newer snapshot with changes"
  ) : (
    "Reviewing is disabled because there's a newer snapshot on <branch>"
  );

  // We show the "go to next build" button if there's no build running or if the running build is complete
  const showButton = switchToNextBuild && (!runningBuild || runningBuild.step === "complete");
  return (
    <Header>
      {runningBuild && <Bar percentage={percentage}>&nbsp;</Bar>}
      <Text>
        {text}{" "}
        {showButton && (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link isButton withArrow onClick={switchToNextBuild}>
            Switch to next build
          </Link>
        )}
      </Text>
    </Header>
  );
}
