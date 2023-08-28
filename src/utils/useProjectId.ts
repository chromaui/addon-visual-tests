import { useAddonState, useChannel } from "@storybook/manager-api";
import React from "react";

import { ADDON_ID, UPDATE_PROJECT, UpdateProjectPayload } from "../constants";

const { CHROMATIC_PROJECT_ID } = process.env;

const projectIdSharedStateKey = `${ADDON_ID}/projectId`;

export const useProjectId = (): [
  projectId: string,
  updateProject: (projectId: string, projectToken?: string) => void,
  projectIdChanged: boolean,
  clearProjectIdChanged: () => void
] => {
  const [projectId, setProjectId] = useAddonState<string | null>(
    projectIdSharedStateKey,
    CHROMATIC_PROJECT_ID
  );
  const [projectIdChanged, setProjectIdChanged] = React.useState(false);

  const emit = useChannel({});

  const updateProject = (newProjectId: string, projectToken: string) => {
    emit(UPDATE_PROJECT, { projectId: newProjectId, projectToken } as UpdateProjectPayload);
    setProjectId(newProjectId);
    setProjectIdChanged(true);
  };
  return [projectId, updateProject, projectIdChanged, () => setProjectIdChanged(false)];
};
