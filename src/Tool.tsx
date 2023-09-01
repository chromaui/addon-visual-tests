import { useChannel } from "@storybook/manager-api";
import React, { useState } from "react";

import { RunTestsButton } from "./components/RunTestsButton";
import { RUNNING_BUILD, RunningBuildPayload, START_BUILD, TOOL_ID } from "./constants";
import { useAddonState } from "./useAddonState/manager";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

export const Tool = () => {
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [runningBuild] = useAddonState<RunningBuildPayload>(RUNNING_BUILD);
  const emit = useChannel({});
  const startBuild = () => emit(START_BUILD);

  const isStarting = ["initializing"].includes(runningBuild?.step);
  return <RunTestsButton key={TOOL_ID} {...{ isStarting, projectId, isLoggedIn, startBuild }} />;
};
