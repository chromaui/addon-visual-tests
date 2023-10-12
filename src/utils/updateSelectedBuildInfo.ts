export interface SelectedBuildInfo {
  storyId: string;
  buildId: string;
}

export function updateSelectedBuildInfo(
  oldSelectedBuildInfo: SelectedBuildInfo | undefined,
  {
    shouldSwitchToLastBuildOnBranch,
    lastBuildOnBranchId,
    storyId,
  }: {
    shouldSwitchToLastBuildOnBranch: boolean;
    lastBuildOnBranchId?: string;
    storyId: string;
  }
) {
  // Never touch the selected build if we don't change story
  if (oldSelectedBuildInfo?.storyId === storyId) return oldSelectedBuildInfo;

  if (!shouldSwitchToLastBuildOnBranch) {
    if (!oldSelectedBuildInfo) return undefined;

    return { ...oldSelectedBuildInfo, storyId };
  }

  if (!lastBuildOnBranchId) throw new Error("Impossible state");
  return {
    buildId: lastBuildOnBranchId,
    storyId,
  };
}
