import { useChannel } from "@storybook/manager-api";
import React, { useEffect } from "react";

import { READ_PROJECT, RESPOND_PROJECT, UPDATE_PROJECT, UpdateProjectPayload } from "../constants";

const { CHROMATIC_PROJECT_ID } = process.env;

export const useProjectId = (): [
  projectId: string,
  updateProject: (projectId: string, projectToken?: string) => void,
  projectIdChanged: boolean,
  clearProjectIdChanged: () => void
] => {
  const [projectId, setProjectId] = React.useState<string | null>(CHROMATIC_PROJECT_ID);
  const [projectIdChanged, setProjectIdChanged] = React.useState(false);

  const emit = useChannel({
    [RESPOND_PROJECT]: (payload: { projectId: string }) => {
      setProjectId(payload.projectId);
      setProjectIdChanged(true);
    },
  });
  useEffect(() => {
    emit(READ_PROJECT);
  }, []);

  const updateProject = (newProjectId: string, projectToken: string) => {
    emit(UPDATE_PROJECT, { projectId: newProjectId, projectToken } as UpdateProjectPayload);
    setProjectId(newProjectId);
    setProjectIdChanged(true);
  };
  return [projectId, updateProject, projectIdChanged, () => setProjectIdChanged(false)];
};
