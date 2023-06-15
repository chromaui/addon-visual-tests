import React, { memo, useCallback, useState } from "react";
import { useAddonState, useChannel } from "@storybook/manager-api";
import { Icons, IconButton } from "@storybook/components";
import { ADDON_ID, BUILD_STARTED, START_BUILD, TOOL_ID } from "./constants";

type BuildInfo = { url: string };

export const Tool = memo(function MyAddonSelector() {
  const [running, setRunning] = useState(false);
  const [, setAddonState] = useAddonState(ADDON_ID);

  const emit = useChannel({
    [BUILD_STARTED]: (build: BuildInfo) => {
      setAddonState({ build });
    },
  });

  const onRun = useCallback(async () => {
    if (running) return;

    setRunning(true);
    emit(START_BUILD);
  }, [running]);

  return (
    <IconButton key={TOOL_ID} active={running} title="Run visual tests" onClick={onRun}>
      <Icons icon="play" /> Run Tests
    </IconButton>
  );
});
