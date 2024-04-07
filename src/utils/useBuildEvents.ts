import { useChannel } from "@storybook/manager-api";
import { useCallback, useEffect, useState } from "react";

import { START_BUILD, STOP_BUILD } from "../constants";
import { LocalBuildProgress } from "../types";

export const useBuildEvents = ({
  localBuildProgress,
  accessToken,
}: {
  localBuildProgress: LocalBuildProgress | undefined;
  accessToken: string | null;
}) => {
  const emit = useChannel({});
  const [isStarting, setStarting] = useState(false);

  const startBuild = useCallback(() => {
    setStarting(true);
    emit(START_BUILD, { accessToken });
  }, [emit, accessToken]);

  const stopBuild = useCallback(() => {
    setStarting(false);
    emit(STOP_BUILD);
  }, [emit]);

  useEffect(() => {
    const timeout = isStarting && setTimeout(() => setStarting(false), 5000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isStarting]);

  const isRunning = localBuildProgress
    ? !["aborted", "complete", "error", "limited"].includes(localBuildProgress.currentStep)
    : isStarting;

  return { isRunning, startBuild, stopBuild };
};
