import React from "react";

import { RunningBuildPayload } from "../constants";

const messageMap: Record<RunningBuildPayload["step"], (payload: RunningBuildPayload) => string> = {
  initialize: () => `📦 Validating Storybook files...`,
  build: () => `📦 Validating Storybook files...`,
  upload: () => `📡 Uploading to Chromatic...`, // TODO represent progress in bytes
  verify: () => `🛠️ Initiating build...`, // TODO build number
  snapshot: () => `👀 Running visual tests...`, // TODO count
  complete: () => `🎉 Visual tests completed!`,
  error: () => `❌ Build failed`, // TODO error
};

interface BuildProgressLabelProps {
  runningBuild: RunningBuildPayload;
}

export const BuildProgressLabel = ({ runningBuild }: BuildProgressLabelProps) => (
  <>{messageMap[runningBuild.step](runningBuild)}</>
);
