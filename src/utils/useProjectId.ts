import { useChannel } from "@storybook/manager-api";
import React from "react";

import {
  PROJECT_UPDATED,
  PROJECT_UPDATING_FAILED,
  ProjectUpdatedPayload,
  ProjectUpdatingFailedPayload,
  UPDATE_PROJECT,
  UpdateProjectPayload,
} from "../constants";

const { CHROMATIC_PROJECT_ID } = process.env;

export const useProjectId = () => {
  const [projectId, setProjectId] = React.useState<string | null>(CHROMATIC_PROJECT_ID);
  const [projectToken, setProjectToken] = React.useState<string | null>();
  const [projectIdUpdated, setProjectIdUpdated] = React.useState(false);
  const [projectUpdatingFailed, setProjectUpdatingFailed] = React.useState(false);
  const [mainPath, setMainPath] = React.useState<string | null>();
  const [configDir, setConfigDir] = React.useState<string | null>();

  const emit = useChannel({
    [PROJECT_UPDATED]: (payload: ProjectUpdatedPayload) => {
      setProjectIdUpdated(true);
      setMainPath(payload.mainPath);
      setConfigDir(payload.configDir);
    },
    [PROJECT_UPDATING_FAILED]: (payload: ProjectUpdatingFailedPayload) => {
      setProjectUpdatingFailed(true);
      setMainPath(payload.mainPath);
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
  return {
    projectId,
    projectToken,
    configDir,
    mainPath,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated: () => setProjectIdUpdated(false),
  };
};
