import { updateSelectedBuildInfo } from "./updateSelectedBuildInfo";

describe("with no selected build", () => {
  it("does nothing if there is no next build", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: undefined,
        storyId: "storyId",
      })
    ).toEqual(undefined);
  });

  it("sets the story build from the next build, simple", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: true,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      })
    ).toEqual({
      buildId: "lastBuildOnBranchId",
      storyId: "storyId",
    });
  });

  // We should remain on the "new build" screen until we see a completed story
  it("does not set the story build from the next build, if the next build should not be switched to", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      })
    ).toEqual(undefined);
  });
});

describe("with a selected build, when not changing story", () => {
  it("does not update the story build from the next build, no matter what", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: true,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "storyId",
        }
      )
    ).toEqual({ buildId: "oldBuildId", storyId: "storyId" });
  });
});

describe("with a selected build, when changing story", () => {
  it("updates the story build from the next build, simple", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: true,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "newStoryId",
        }
      )
    ).toEqual({
      buildId: "lastBuildOnBranchId",
      storyId: "newStoryId",
    });
  });

  it("does not update the story build from the next build, if the next build should not be switched to", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: false,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "newStoryId",
        }
      )
    ).toEqual({ buildId: "oldBuildId", storyId: "newStoryId" });
  });
});
