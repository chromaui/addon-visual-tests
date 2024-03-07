import React, { createContext } from "react";

import { useRequiredContext } from "../../utils/useRequiredContext";

const initialState = {
  isRunning: false,
  startBuild: () => {},
  stopBuild: () => {},
};

type State = typeof initialState;

export const RunBuildContext = createContext(initialState);

export const useRunBuildState = () => useRequiredContext(RunBuildContext, "RunBuild");

export const RunBuildProvider = ({
  children,
  watchState = initialState,
}: {
  children: React.ReactNode;
  watchState?: State;
}) => {
  return <RunBuildContext.Provider value={watchState}>{children}</RunBuildContext.Provider>;
};
