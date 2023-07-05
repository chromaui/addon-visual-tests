import { useGlobals, useParameter } from "@storybook/manager-api";
import React from "react";

import { PROJECT_PARAM_KEY } from "../constants";

let inMemoryProjectId: string | null = null;

export const useProjectId = (): [
  projectId: string,
  updateProjectId: (projectId: string) => void,
  projectIdChanged: boolean,
  clearProjectIdChanged: () => void
] => {
  //
  // Ideally this should only be configured once in main.ts. We'll need to figure out how to do that. This should at least read from that config for now.
  const configuredProjectId = useParameter(PROJECT_PARAM_KEY, null);
  // const token = useParameter("projectToken", null);
  // Should this use globals and parameters together like how the BackgroundSelector addon does? https://github.com/storybookjs/storybook/blob/f57e67f302865930f1bca01a977d0624ea663f19/code/addons/backgrounds/src/containers/BackgroundSelector.tsx#L81C34-L81C34
  const [projectId, setProjectId] = React.useState<string | null>(
    configuredProjectId || inMemoryProjectId
  );

  const updateProjectId = (id: string) => {
    inMemoryProjectId = id;
    setProjectId(inMemoryProjectId);
  };

  // Used for now to prompt user to update project id in main.ts manually
  const [clearedProjectIdChanged, setClearedProjectIdChanged] = React.useState(false);
  const projectIdChanged = configuredProjectId !== projectId && !!clearedProjectIdChanged;

  console.log({
    configuredProjectId,
    projectId,
    projectIdChanged,
  });
  return [projectId, updateProjectId, projectIdChanged, () => setClearedProjectIdChanged(true)];
};
