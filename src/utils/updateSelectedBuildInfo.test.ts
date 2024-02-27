import { expect, it } from "vitest";

import { updateSelectedBuildInfo } from "./updateSelectedBuildInfo";

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

it("updates the story build from the next build, simple", () => {
  expect(
    updateSelectedBuildInfo(
      { buildId: "oldBuildId", storyId: "storyId" },
      {
        shouldSwitchToLastBuildOnBranch: true,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      }
    )
  ).toEqual({
    buildId: "lastBuildOnBranchId",
    storyId: "storyId",
  });
});

it("does not update the story build from the next build, if the next build should not be switched to", () => {
  expect(
    updateSelectedBuildInfo(
      { buildId: "oldBuildId", storyId: "storyId" },
      {
        shouldSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "storyId",
      }
    )
  ).toEqual({ buildId: "oldBuildId", storyId: "storyId" });
});

it("updates the storyId, simple", () => {
  expect(
    updateSelectedBuildInfo(
      {
        buildId: "lastBuildOnBranchId",
        storyId: "storyId",
      },
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

it("updates the storyId, keeping the old build if the next build should not be switched to", () => {
  expect(
    updateSelectedBuildInfo(
      {
        buildId: "oldBuildId",
        storyId: "storyId",
      },
      {
        shouldSwitchToLastBuildOnBranch: false,
        lastBuildOnBranchId: "lastBuildOnBranchId",
        storyId: "newStoryId",
      }
    )
  ).toEqual({
    buildId: "oldBuildId",
    storyId: "newStoryId",
  });
});
