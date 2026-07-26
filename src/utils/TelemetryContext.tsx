import React, { createContext, useCallback, useEffect } from 'react';

import { useRequiredContext } from './useRequiredContext';

/**
 * The complete vocabulary of user-initiated actions we report. Keep this list closed: `location`
 * and `screen` already say *where* an action happened, so action names should describe *what* the
 * user did and stay stable across screens (e.g. `signIn`, not `verifySignIn`).
 */
export type TelemetryAction =
  | 'catchAChange'
  | 'completeOnboarding'
  | 'continue'
  | 'createProject'
  | 'goBack'
  | 'openWarning'
  | 'selectAccount'
  | 'selectProject'
  | 'signIn'
  | 'signInWithSSO'
  | 'skipOnboarding'
  | 'startBuild'
  | 'stopBuild'
  | 'submitSubdomain'
  | 'uninstallAddon';

export type TrackEvent = (event: { [key: string]: any }) => void;
export type TrackAction = (action: TelemetryAction, extra?: Record<string, unknown>) => void;

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

/**
 * Returns a tracker that tags actions with the given screen, without reporting a screen view. Use
 * this when the component reporting the action isn't the one that owns the screen view — otherwise
 * use `useTelemetry`, which does both.
 */
export const useTrackAction = (location: string, screen: string): TrackAction => {
  const trackEvent = useRequiredContext(TelemetryContext, 'Telemetry');
  return useCallback(
    (action, extra) => trackEvent({ ...extra, action, location, screen }),
    [location, screen, trackEvent]
  );
};

export const useTelemetry = (location: string, screen: string): TrackAction => {
  const trackEvent = useRequiredContext(TelemetryContext, 'Telemetry');
  useEffect(() => trackEvent({ location, screen }), [location, screen, trackEvent]);
  return useTrackAction(location, screen);
};
