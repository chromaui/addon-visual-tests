export interface SelectedBuildInfo {
  storyId: string;
  buildId?: string;
}

export function updateSelectedBuildInfo(
  oldSelectedBuildInfo: SelectedBuildInfo,
  {
    shouldSwitchToLastBuildOnBranch,
    lastBuildOnBranchId,
    storyId,
  }: {
    shouldSwitchToLastBuildOnBranch: boolean;
    lastBuildOnBranchId: string;
    storyId: string;
  }
) {
  if (!shouldSwitchToLastBuildOnBranch) {
    return { ...oldSelectedBuildInfo, storyId };
  }

  return {
    buildId: lastBuildOnBranchId,
    storyId,
  };
}
