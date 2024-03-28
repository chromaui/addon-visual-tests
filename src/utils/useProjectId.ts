import { useCallback } from "react";

import { PROJECT_INFO } from "../constants";
import { ProjectInfoPayload } from "../types";
import { useSharedState } from "./useSharedState";

export const useProjectId = () => {
  const [projectInfo, setProjectInfo] = useSharedState<ProjectInfoPayload>(PROJECT_INFO);
  const { projectId, written, dismissed, configFile } = projectInfo || {};

  return {
    loading: !projectInfo,
    projectId,
    configFile,
    updateProject: useCallback(
      (id: string) => setProjectInfo({ ...projectInfo, projectId: id, dismissed: false }),
      [projectInfo, setProjectInfo]
    ),
    projectUpdatingFailed: !dismissed && written === false,
    projectIdUpdated: !dismissed && written === true,
    clearProjectIdUpdated: useCallback(
      () => setProjectInfo({ ...projectInfo, dismissed: true }),
      [projectInfo, setProjectInfo]
    ),
  };
};
