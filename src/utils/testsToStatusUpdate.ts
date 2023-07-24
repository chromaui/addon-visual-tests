import type { API } from "@storybook/manager-api";
import type { StoryId } from "@storybook/types";

import type { TestFieldsFragment, TestStatus, ViewportInfo } from "../gql/graphql";

export type StatusUpdate = Parameters<API["experimental_updateStatus"]>[1];
type StoryStatus = StatusUpdate[any]["status"];

const statusMap: Record<TestStatus, StoryStatus> = {
  IN_PROGRESS: "pending",
  PASSED: null,
  ACCEPTED: null,
  PENDING: "warn",
  FAILED: "error",
  DENIED: "error",
  BROKEN: "error",
};

// Just the bits we need
type ReducedTest = Pick<TestFieldsFragment, "story" | "status">;

const statusOrder: StoryStatus[] = ["unknown", "pending", "success", "warn", "error"];
function chooseWorseStatus(status: StoryStatus, oldStatus: StoryStatus | null) {
  if (!oldStatus) return status;

  return statusOrder[Math.max(statusOrder.indexOf(status), statusOrder.indexOf(oldStatus))];
}

export function testsToStatusUpdate<T extends ReducedTest>(tests: T[]): StatusUpdate {
  const storyIdToStatus: Record<StoryId, StoryStatus> = {};
  tests.forEach((test) => {
    storyIdToStatus[test.story.storyId] = chooseWorseStatus(
      statusMap[test.status],
      storyIdToStatus[test.story.storyId]
    );
  });
  const update = Object.fromEntries(
    Object.entries(storyIdToStatus).map(([storyId, status]) => [
      storyId,
      {
        status,
        title: "Visual Tests",
        description: "Chromatic Visual Tests",
      },
    ])
  );

  return update;
}
