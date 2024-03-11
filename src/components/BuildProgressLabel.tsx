import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { LocalBuildProgress } from "../types";
import { Text } from "./Text";

interface BuildProgressLabelProps {
  localBuildProgress: LocalBuildProgress;
  withEmoji?: boolean;
}

export const BuildProgressLabel = ({
  localBuildProgress,
  withEmoji = false,

  ...props
}: BuildProgressLabelProps) => {
  const { emoji, renderProgress } = BUILD_STEP_CONFIG[localBuildProgress.currentStep];
  const label = renderProgress(localBuildProgress);
  return (
    <Text {...props}>
      {withEmoji && emoji} {label}
    </Text>
  );
};
