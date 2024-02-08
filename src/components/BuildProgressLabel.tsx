import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { LocalBuildProgress } from "../types";

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
    <span {...props}>
      {withEmoji && emoji} {label}
    </span>
  );
};
