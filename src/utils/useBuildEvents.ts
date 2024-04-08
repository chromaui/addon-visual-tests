import { useChannel } from "@storybook/manager-api";
import { useCallback, useEffect, useState } from "react";

import { START_BUILD, STOP_BUILD } from "../constants";
import { LocalBuildProgress } from "../types";
import { TelemetryContext } from "./TelemetryContext";
import { useRequiredContext } from "./useRequiredContext";

export const useBuildEvents = ({
  localBuildProgress,
  accessToken,
}: {
  localBuildProgress: LocalBuildProgress | undefined;
  accessToken: string | null;
}) => {
  const emit = useChannel({});
  const [isStarting, setStarting] = useState(false);
  const trackEvent = useRequiredContext(TelemetryContext, "Telemetry");

  const startBuild = useCallback(() => {
    setStarting(true);
    emit(START_BUILD, { accessToken });
    trackEvent({ action: "startBuild" });
  }, [accessToken, emit, trackEvent]);

  const stopBuild = useCallback(() => {
    setStarting(false);
    emit(STOP_BUILD);
    trackEvent({ action: "stopBuild" });
  }, [emit, trackEvent]);

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
