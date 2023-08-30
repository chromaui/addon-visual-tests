import { Icons } from "@storybook/components";
import React from "react";

import { IconButton } from "./IconButton";
import { ProgressIcon } from "./icons/ProgressIcon";

export function RunTestsButton({
  isStarting,
  projectId,
  isLoggedIn,
  startBuild,
}: {
  isStarting: boolean;
  projectId: string;
  isLoggedIn: boolean;
  startBuild: () => void;
}) {
  return projectId && isLoggedIn ? (
    <IconButton
      style={{ marginTop: 6 }}
      active={isStarting}
      disabled={isStarting}
      title="Run visual tests"
      onClick={() => startBuild()}
    >
      {isStarting ? (
        <ProgressIcon parentComponent="IconButton" style={{ marginRight: 6 }} />
      ) : (
        <Icons icon="play" style={{ marginRight: 6 }} />
      )}
      Run tests
    </IconButton>
  ) : null;
}
