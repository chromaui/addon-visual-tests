import React, { createContext, useEffect } from "react";

import { useRequiredContext } from "./useRequiredContext";

export type TrackEvent = (event: { [key: string]: any }) => void;

export const TelemetryContext = createContext<TrackEvent | null>(null);

export const TelemetryProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TrackEvent;
}) => {
  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = (location: string, screen: string) => {
  const trackEvent = useRequiredContext(TelemetryContext, "Telemetry");
  useEffect(() => trackEvent({ location, screen }), [location, screen, trackEvent]);
};
