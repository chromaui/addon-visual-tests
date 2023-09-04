import { useState } from "react";

import { PROJECT_INFO, ProjectInfoPayload } from "../constants";
import { useAddonState } from "../useAddonState/manager";

export const useProjectId = () => {
  const [projectInfo, setProjectInfo] = useAddonState<ProjectInfoPayload>(PROJECT_INFO);

  // Once we've seen the state of the update, we can "clear" it to move on
  const [clearUpdated, setClearUpdated] = useState(false);

  const updateProject = (newProjectId: string, newProjectToken: string) => {
    setClearUpdated(false);
    setProjectInfo({
      projectId: newProjectId,
      projectToken: newProjectToken,
    });
  };

  const { projectId, projectToken, written, configDir, mainPath } = projectInfo || {};
  return {
    loading: !projectInfo,
    projectId,
    projectToken,
    configDir,
    mainPath,
    updateProject,
    projectUpdatingFailed: !clearUpdated && written === false,
    projectIdUpdated: !clearUpdated && written === true,
    clearProjectIdUpdated: () => setClearUpdated(true),
  };
};
