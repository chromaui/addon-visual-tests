export interface StoryBuildInfo {
  storyId: string;
  buildId?: string;
}

export function updateStoryBuildInfo(
  oldStoryBuildInfo: StoryBuildInfo,
  {
    shouldSwitchToNextBuild,
    nextBuildId,
    storyId,
  }: {
    shouldSwitchToNextBuild: boolean;
    nextBuildId: string;
    storyId: string;
  }
) {
  if (!shouldSwitchToNextBuild) {
    return { ...oldStoryBuildInfo, storyId };
  }

  return {
    buildId: nextBuildId,
    storyId,
  };
}
