import { updateStoryBuildInfo } from "./updateStoryBuildInfo";

it("does nothing if there is no next build", () => {
  expect(
    updateStoryBuildInfo(
      { storyId: "storyId" },
      {
        shouldSwitchToNextBuild: false,
        nextBuildId: undefined,
        storyId: "storyId",
      }
    )
  ).toEqual({ storyId: "storyId" });
});

it("sets the story build from the next build, simple", () => {
  expect(
    updateStoryBuildInfo(
      { storyId: "storyId" },
      {
        shouldSwitchToNextBuild: true,
        nextBuildId: "nextBuildId",
        storyId: "storyId",
      }
    )
  ).toEqual({
    buildId: "nextBuildId",
    storyId: "storyId",
  });
});

// We should remain on the "new build" screen until we see a completed story
it("does not set the story build from the next build, if the next build should not be switched to", () => {
  expect(
    updateStoryBuildInfo(
      { storyId: "storyId" },
      {
        shouldSwitchToNextBuild: false,
        nextBuildId: "nextBuildId",
        storyId: "storyId",
      }
    )
  ).toEqual({ storyId: "storyId" });
});

it("updates the story build from the next build, simple", () => {
  expect(
    updateStoryBuildInfo(
      { buildId: "oldBuildId", storyId: "storyId" },
      {
        shouldSwitchToNextBuild: true,
        nextBuildId: "nextBuildId",
        storyId: "storyId",
      }
    )
  ).toEqual({
    buildId: "nextBuildId",
    storyId: "storyId",
  });
});

it("does not update the story build from the next build, if the next build should not be switched to", () => {
  expect(
    updateStoryBuildInfo(
      { buildId: "oldBuildId", storyId: "storyId" },
      {
        shouldSwitchToNextBuild: false,
        nextBuildId: "nextBuildId",
        storyId: "storyId",
      }
    )
  ).toEqual({ buildId: "oldBuildId", storyId: "storyId" });
});

it("updates the storyId, simple", () => {
  expect(
    updateStoryBuildInfo(
      {
        buildId: "nextBuildId",
        storyId: "storyId",
      },
      {
        shouldSwitchToNextBuild: true,
        nextBuildId: "nextBuildId",
        storyId: "newStoryId",
      }
    )
  ).toEqual({
    buildId: "nextBuildId",
    storyId: "newStoryId",
  });
});

it("updates the storyId, keeping the old build if the next build should not be switched to", () => {
  expect(
    updateStoryBuildInfo(
      {
        buildId: "oldBuildId",
        storyId: "storyId",
      },
      {
        shouldSwitchToNextBuild: false,
        nextBuildId: "nextBuildId",
        storyId: "newStoryId",
      }
    )
  ).toEqual({
    buildId: "oldBuildId",
    storyId: "newStoryId",
  });
});
