import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { RunningBuildPayload } from "../types";

interface BuildProgressLabelProps {
  runningBuild: RunningBuildPayload;
}

export const BuildProgressLabel = ({ runningBuild }: BuildProgressLabelProps) => {
  const { emoji, renderProgress } = BUILD_STEP_CONFIG[runningBuild.currentStep];
  return (
    <>
      {emoji} {renderProgress(runningBuild)}
    </>
  );
};
