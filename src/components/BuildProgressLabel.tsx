import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { LocalBuildProgress } from "../types";

interface BuildProgressLabelProps {
  localBuildProgress: LocalBuildProgress;
}

export const BuildProgressLabel = ({ localBuildProgress }: BuildProgressLabelProps) => {
  const { emoji, renderProgress } = BUILD_STEP_CONFIG[localBuildProgress.currentStep];
  return (
    <>
      {emoji} {renderProgress(localBuildProgress)}
    </>
  );
};
