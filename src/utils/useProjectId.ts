import { useChannel, useParameter } from "@storybook/manager-api";
import React from "react";

import { PROJECT_PARAM_KEY, PROJECT_UPDATED, UPDATE_PROJECT } from "../constants";

let inMemoryProjectId: string | null = null;

export const useProjectId = (): [
  projectId: string,
  updateProject: (projectId: string, projectToken?: string) => void,
  projectIdChanged: boolean,
  clearProjectIdChanged: () => void
] => {
  //
  // Ideally this should only be configured once in main.ts. We'll need to figure out how to do that. This should at least read from that config for now.
  const configuredProjectId = useParameter(PROJECT_PARAM_KEY, null);

  const [projectId, setProjectId] = React.useState<string | null>(null);

  const actualProjectId = React.useMemo(
    () => projectId || inMemoryProjectId || configuredProjectId,
    [projectId, configuredProjectId]
  );

  // TODO: This is where we need to update the main.ts config with the projectId
  const emit = useChannel({
    [PROJECT_UPDATED]: (selectedProjectId: string, projectToken) => {
      console.log("projectId selected from emit", selectedProjectId);
      setProjectId(selectedProjectId);
    },
  });

  const updateProject = (id: string, projectToken: string) => {
    emit(UPDATE_PROJECT, id, projectToken);
    inMemoryProjectId = id;
    setProjectId(inMemoryProjectId);
  };

  // Used for now to prompt user to update project id in main.ts manually
  const [clearedProjectIdChanged, setClearedProjectIdChanged] = React.useState(false);
  const projectIdChanged = configuredProjectId !== actualProjectId && !!clearedProjectIdChanged;

  console.log({
    configuredProjectId,
    projectId,
    projectIdChanged,
  });
  return [actualProjectId, updateProject, projectIdChanged, () => setClearedProjectIdChanged(true)];
};
