import { IconButton, Icons } from "@storybook/components";
import { useAddonState, useChannel } from "@storybook/manager-api";
import React, { useCallback } from "react";

import { ProgressIcon } from "./components/icons/ProgressIcon";
import { ADDON_ID, BUILD_STARTED, DEV_BUILD_ID_KEY, START_BUILD, TOOL_ID } from "./constants";
import { AddonState } from "./types";

const storedBuildId = localStorage.getItem(DEV_BUILD_ID_KEY);

export const Tool = () => {
  const [state, setAddonState] = useAddonState<AddonState>(ADDON_ID, {
    isOutdated: true,
    lastBuildId: storedBuildId,
  });

  const emit = useChannel(
    {
      [BUILD_STARTED]: (buildId: string) => {
        setAddonState({ ...state, lastBuildId: buildId });
        localStorage.setItem(DEV_BUILD_ID_KEY, buildId);
      },
    },
    [state, setAddonState]
  );

  const runDevBuild = useCallback(() => {
    if (state.isRunning) return;
    setAddonState({ ...state, isRunning: true });
    emit(START_BUILD);
  }, [emit, state, setAddonState]);

  return (
    <IconButton
      active={state.isRunning}
      disabled={state.isRunning}
      key={TOOL_ID}
      title="Run visual tests"
      onClick={runDevBuild}
    >
      {state.isRunning ? (
        <ProgressIcon onButton />
      ) : (
        <Icons icon="play" style={{ marginRight: 6 }} />
      )}
      Run tests
    </IconButton>
  );
};
