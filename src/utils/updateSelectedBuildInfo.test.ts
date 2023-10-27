import { updateSelectedBuildInfo } from "./updateSelectedBuildInfo";

describe("with no selected build", () => {
  it("does nothing if there is no last build on branch", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: false,
        forceSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: undefined,
        storyId: "storyId",
      })
    ).toEqual(undefined);
  });

  it("sets the selected build from the last build on branch, simple", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: true,
        forceSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      })
    ).toEqual({
      buildId: "lastBuildOnBranchId",
      storyId: "storyId",
    });
  });

  // We should remain on the "new build" screen until we see a completed story
  it("does not set the selected build from the last build on branch, if the last build on branch should not be switched to", () => {
    expect(
      updateSelectedBuildInfo(undefined, {
        shouldSwitchToLastBuildOnBranch: false,
        forceSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      })
    ).toEqual(undefined);
  });
});

describe("with a selected build, when not changing story", () => {
  it("does not update the selected build from the last build on branch, even if we should", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: true,
          forceSwitchToLastBuildOnBranch: false,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "storyId",
        }
      )
    ).toEqual({ buildId: "oldBuildId", storyId: "storyId" });
  });

  it("does update the selected build from the last build on branch, if forced", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: true,
          forceSwitchToLastBuildOnBranch: true,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "storyId",
        }
      )
    ).toEqual({ buildId: "lastBuildOnBranchId", storyId: "storyId" });
  });
});

describe("with a selected build, when changing story", () => {
  it("updates the selected build from the last build on branch, simple", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: true,
          forceSwitchToLastBuildOnBranch: false,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "newStoryId",
        }
      )
    ).toEqual({
      buildId: "lastBuildOnBranchId",
      storyId: "newStoryId",
    });
  });

  it("does not update the selected build from the last build on branch, if the last build on branch should not be switched to", () => {
    expect(
      updateSelectedBuildInfo(
        { buildId: "oldBuildId", storyId: "storyId" },
        {
          shouldSwitchToLastBuildOnBranch: false,
          forceSwitchToLastBuildOnBranch: false,
          lastBuildOnBranchId: "lastBuildOnBranchId",
          storyId: "newStoryId",
        }
      )
    ).toEqual({ buildId: "oldBuildId", storyId: "newStoryId" });
  });
});
