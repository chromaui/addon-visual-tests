import { Icons } from "@storybook/components";
import React from "react";

import { IconButton } from "./IconButton";
import { ProgressIcon } from "./icons/ProgressIcon";

export function RunTestsButton({
  isStarting,
  projectId,
  accessToken,
  startBuild,
  key,
}: {
  isStarting: boolean;
  projectId: string;
  accessToken: string;
  startBuild: () => void;
  key: string;
}) {
  return projectId && accessToken ? (
    <IconButton
      active={isStarting}
      disabled={isStarting}
      key={key}
      title="Run visual tests"
      onClick={() => startBuild}
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
