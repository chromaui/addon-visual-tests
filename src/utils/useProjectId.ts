import { useCallback, useState } from "react";

import { PROJECT_INFO } from "../constants";
import { ProjectInfoPayload } from "../types";
import { useSharedState } from "./useSharedState";

export const useProjectId = () => {
  const [projectInfo, setProjectInfo] = useSharedState<ProjectInfoPayload>(PROJECT_INFO);

  // Once we've seen the state of the update, we can "clear" it to move on
  const [clearUpdated, setClearUpdated] = useState(false);

  const updateProject = useCallback(
    (newProjectId: string) => {
      setClearUpdated(false);
      setProjectInfo({ projectId: newProjectId });
    },
    [setProjectInfo]
  );

  const { projectId, written, configFile, isProjectInfoLoading } = projectInfo || {};
  return {
    loading: !!isProjectInfoLoading,
    projectId,
    configFile,
    updateProject,
    projectUpdatingFailed: !clearUpdated && written === false,
    projectIdUpdated: !clearUpdated && written === true,
    clearProjectIdUpdated: () => setClearUpdated(true),
  };
};
