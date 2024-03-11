import { styled } from "@storybook/theming";
import React from "react";

import { LocalBuildProgress } from "../types";
import { BuildProgressLabel } from "./BuildProgressLabel";
import { ProgressBar, ProgressTrack } from "./SidebarTopButton";
import { Text } from "./Text";

const ProgressTextWrapper = styled(Text)({
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: 200,
  marginTop: 15,
});

const StyledBuildProgressLabel = styled(BuildProgressLabel)({
  fontSize: 12,
});

export function BuildProgressInline({
  localBuildProgress,
}: {
  localBuildProgress: LocalBuildProgress;
}) {
  return (
    <ProgressTextWrapper small as="div">
      <ProgressTrack>
        {typeof localBuildProgress.buildProgressPercentage === "number" && (
          <ProgressBar style={{ width: `${localBuildProgress.buildProgressPercentage}%` }} />
        )}
      </ProgressTrack>
      <StyledBuildProgressLabel localBuildProgress={localBuildProgress} />
    </ProgressTextWrapper>
  );
}
