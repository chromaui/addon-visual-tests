import React, { createContext, useMemo, useReducer } from "react";

import { useRequiredContext } from "../../utils/useRequiredContext";

const initialControls = {
  configVisible: false,
  settingsVisible: false,
  warningsVisible: false,
  baselineImageVisible: false,
  focusVisible: false,
  diffVisible: false,
};

type State = typeof initialControls;

const toggle =
  (key: keyof State) =>
  (state: State, visible?: boolean): State => ({
    ...state,
    [key]: typeof visible === "boolean" ? visible : !state[key],
  });

const handlers = {
  toggleDiff: toggle("diffVisible"),
  toggleFocus: toggle("focusVisible"),
  toggleConfig: toggle("configVisible"),
  toggleSettings: toggle("settingsVisible"),
  toggleWarnings: toggle("warningsVisible"),
  toggleBaselineImage: toggle("baselineImageVisible"),
} as const;

type Action = { type: keyof typeof handlers; payload?: any };

const controlsReducer = (state: State, action: Action) =>
  handlers[action.type](state, action.payload);

export const ControlsContext = createContext(initialControls);
export const ControlsDispatchContext = createContext<React.Dispatch<Action>>(() => {});

export const useControlsState = () => useRequiredContext(ControlsContext, "Controls");
export const useControlsDispatch = () => {
  const dispatch = useRequiredContext(ControlsDispatchContext, "ControlsDispatch");
  return useMemo(
    () => ({
      toggleDiff: (visible?: boolean) => dispatch({ type: "toggleDiff", payload: visible }),
      toggleFocus: (visible?: boolean) => dispatch({ type: "toggleFocus", payload: visible }),
      toggleConfig: (visible?: boolean) => dispatch({ type: "toggleConfig", payload: visible }),
      toggleSettings: (visible?: boolean) => dispatch({ type: "toggleSettings", payload: visible }),
      toggleWarnings: (visible?: boolean) => dispatch({ type: "toggleWarnings", payload: visible }),
      toggleBaselineImage: (visible?: boolean) =>
        dispatch({ type: "toggleBaselineImage", payload: visible }),
    }),
    [dispatch],
  );
};

export const ControlsProvider = ({
  children,
  initialState = initialControls,
}: {
  children: React.ReactNode;
  initialState?: State;
}) => {
  const [state, dispatch] = useReducer(controlsReducer, initialState);

  return (
    <ControlsContext.Provider value={state}>
      <ControlsDispatchContext.Provider value={dispatch}>
        {children}
      </ControlsDispatchContext.Provider>
    </ControlsContext.Provider>
  );
};
