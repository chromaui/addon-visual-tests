import React, { createContext } from 'react';

import type { BuildTelemetryContext } from '../../utils/useBuildEvents';
import { useRequiredContext } from '../../utils/useRequiredContext';

type State = {
  isRunning: boolean;
  startBuild: (context?: BuildTelemetryContext) => void;
  stopBuild: (context?: BuildTelemetryContext) => void;
};

const initialState: State = {
  isRunning: false,
  startBuild: () => {},
  stopBuild: () => {},
};

export const RunBuildContext = createContext(initialState);

export const useRunBuildState = () => useRequiredContext(RunBuildContext, 'RunBuild');

export const RunBuildProvider = ({
  children,
  watchState = initialState,
}: {
  children: React.ReactNode;
  watchState?: State;
}) => {
  return <RunBuildContext.Provider value={watchState}>{children}</RunBuildContext.Provider>;
};
