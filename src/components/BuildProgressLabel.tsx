import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { LocalBuildProgressPayload } from "../types";

interface BuildProgressLabelProps {
  localBuildProgress: LocalBuildProgressPayload;
}

export const BuildProgressLabel = ({ localBuildProgress }: BuildProgressLabelProps) => {
  const { emoji, renderProgress } = BUILD_STEP_CONFIG[localBuildProgress.currentStep];
  return (
    <>
      {emoji} {renderProgress(localBuildProgress)}
    </>
  );
};
