import { useChannel } from "@storybook/manager-api";
import React, { useState } from "react";

import { RunTestsButton } from "./components/RunTestsButton";
import { BUILD_STARTED, START_BUILD, TOOL_ID } from "./constants";
import { useAccessToken } from "./utils/graphQLClient";
import { useProjectId } from "./utils/useProjectId";

export const Tool = () => {
  const [isStarting, setIsStarting] = useState(false);
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const emit = useChannel(
    {
      [START_BUILD]: () => setIsStarting(true),
      [BUILD_STARTED]: () => setIsStarting(false),
    },
    []
  );

  const startBuild = () => {
    emit(START_BUILD);
  };

  return <RunTestsButton key={TOOL_ID} {...{ isStarting, projectId, isLoggedIn, startBuild }} />;
};
