import { styled } from "@storybook/theming";
import React from "react";

import { BUILD_STEP_CONFIG } from "../buildSteps";
import { LocalBuildProgress } from "../types";

interface BuildProgressLabelProps {
  localBuildProgress: LocalBuildProgress;
  withEmoji?: boolean;
}

const Label = styled.span({
  fontSize: 14,
  lineHeight: "20px",
});

export const BuildProgressLabel = ({
  localBuildProgress,
  withEmoji = false,

  ...props
}: BuildProgressLabelProps) => {
  const { emoji, renderProgress } = BUILD_STEP_CONFIG[localBuildProgress.currentStep];
  const label = renderProgress(localBuildProgress);
  return (
    <Label {...props}>
      {withEmoji && emoji} {label}
    </Label>
  );
};
