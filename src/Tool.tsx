import React, { memo, useCallback, useState } from "react";
import { useAddonState } from "@storybook/manager-api";
import { Icons, IconButton } from "@storybook/components";
import { ADDON_ID, TOOL_ID } from "./constants";

// Temporary approach, later we'll use the server channel for this.
const cliServerUrl = "http://localhost:8765";

type BuildInfo = { url: string };
async function runBuild() {
  const response = await fetch(`${cliServerUrl}/build`, { method: "POST" });

  if (!response.ok)
    throw new Error(`Failed to run build: ${response.statusText}`);

  return (await response.json()) as BuildInfo;
}

export const Tool = memo(function MyAddonSelector() {
  const [running, setRunning] = useState(false);
  const [_, setAddonState] = useAddonState(ADDON_ID);

  const onRun = useCallback(async () => {
    if (running) return;

    setRunning(true);
    try {
      const build = await runBuild();
      setAddonState({ build });
    } finally {
      console.log("finally");
      setRunning(false);
    }
  }, [running]);

  return (
    <IconButton
      key={TOOL_ID}
      active={running}
      title="Run visual tests"
      onClick={onRun}
    >
      <Icons icon="play" /> Run Tests
    </IconButton>
  );
});
