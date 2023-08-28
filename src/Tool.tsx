import { IconButton, Icons } from "@storybook/components";
import { useChannel } from "@storybook/manager-api";
import React, { useState } from "react";

import { ProgressIcon } from "./components/icons/ProgressIcon";
import { BUILD_PROGRESS, BuildProgressPayload, START_BUILD, TOOL_ID } from "./constants";

export const Tool = () => {
  const [isStarting, setIsStarting] = useState(false);

  const emit = useChannel(
    {
      [START_BUILD]: () => setIsStarting(true),
      [BUILD_PROGRESS]: ({ step }: BuildProgressPayload) => {
        if (step === "snapshot" || step === "complete") {
          setIsStarting(false);
        }
      },
    },
    []
  );

  return (
    <IconButton
      active={isStarting}
      disabled={isStarting}
      key={TOOL_ID}
      title="Run visual tests"
      onClick={() => emit(START_BUILD)}
    >
      {isStarting ? (
        <ProgressIcon parentComponent="IconButton" style={{ marginRight: 6 }} />
      ) : (
        <Icons icon="play" style={{ marginRight: 6 }} />
      )}
      Run tests
    </IconButton>
  );
};
