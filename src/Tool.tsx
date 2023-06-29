import { IconButton, Icons } from "@storybook/components";
import { useAddonState, useChannel } from "@storybook/manager-api";
import React, { memo, useCallback } from "react";

import { ProgressIcon } from "./components/icons/ProgressIcon";
import { ADDON_ID, BUILD_STARTED, DEV_BUILD_ID_KEY, START_BUILD, TOOL_ID } from "./constants";
import { AddonState } from "./types";

const storedBuildId = localStorage.getItem(DEV_BUILD_ID_KEY);

export const Tool = memo(function MyAddonSelector() {
  const [{ running }, setAddonState] = useAddonState<AddonState>(ADDON_ID, {
    lastBuildId: storedBuildId,
  });

  const emit = useChannel({
    [BUILD_STARTED]: (buildId: string) => {
      setAddonState((state: AddonState) => ({ ...state, lastBuildId: buildId }));
      localStorage.setItem(DEV_BUILD_ID_KEY, buildId);
    },
  });

  const runDevBuild = useCallback(() => {
    if (running) return;
    setAddonState((state: AddonState) => ({ ...state, running: true }));
    emit(START_BUILD);
  }, [emit, running, setAddonState]);

  return (
    <IconButton key={TOOL_ID} active={running} title="Run visual tests" onClick={runDevBuild}>
      {running ? <ProgressIcon onButton /> : <Icons icon="play" style={{ marginRight: 6 }} />}
      Run tests
    </IconButton>
  );
});
