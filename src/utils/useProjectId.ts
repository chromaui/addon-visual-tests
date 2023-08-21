import { useChannel } from "@storybook/manager-api";
import React from "react";

import {
  PROJECT_UPDATED,
  PROJECT_UPDATING_FAILED,
  ProjectUpdatingFailedPayload,
  UPDATE_PROJECT,
  UpdateProjectPayload,
} from "../constants";

const { CHROMATIC_PROJECT_ID } = process.env;

export const useProjectId = (): [
  projectId: string,
  projectToken: string,
  configDir: string,
  updateProject: (projectId: string, projectToken?: string) => void,
  projectUpdatingFailed: boolean,
  projectIdChanged: boolean,
  clearProjectIdChanged: () => void
] => {
  const [projectId, setProjectId] = React.useState<string | null>(CHROMATIC_PROJECT_ID);
  const [projectToken, setProjectToken] = React.useState<string | null>();
  const [projectIdChanged, setProjectIdChanged] = React.useState(false);
  const [projectUpdatingFailed, setProjectUpdatingFailed] = React.useState(false);
  const [configDir, setConfigDir] = React.useState<string | null>();

  const emit = useChannel({
    [PROJECT_UPDATED]: () => setProjectIdChanged(true),
    [PROJECT_UPDATING_FAILED]: (payload: ProjectUpdatingFailedPayload) => {
      setProjectUpdatingFailed(true);
      setConfigDir(payload.configDir);
    },
  });

  const updateProject = (newProjectId: string, newProjectToken: string) => {
    emit(UPDATE_PROJECT, {
      projectId: newProjectId,
      projectToken: newProjectToken,
    } as UpdateProjectPayload);
    setProjectId(newProjectId);
    setProjectToken(newProjectToken);
  };
  return [
    projectId,
    projectToken,
    configDir,
    updateProject,
    projectUpdatingFailed,
    projectIdChanged,
    () => setProjectIdChanged(false),
  ];
};
