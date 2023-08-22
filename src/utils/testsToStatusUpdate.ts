import type { API } from "@storybook/manager-api";
import type { StoryId } from "@storybook/types";

import { StatusTestFieldsFragment, TestStatus } from "../gql/graphql";

export type StatusUpdate = Parameters<API["experimental_updateStatus"]>[1];
type StoryStatus = StatusUpdate[any]["status"];

export const statusMap: Partial<Record<TestStatus, StoryStatus>> = {
  [TestStatus.InProgress]: "pending",
  [TestStatus.Pending]: "warn",
  [TestStatus.Failed]: "error",
  [TestStatus.Denied]: "error",
  [TestStatus.Broken]: "error",
};

const statusOrder: StoryStatus[] = ["unknown", "pending", "success", "warn", "error"];
function chooseWorseStatus(status: StoryStatus, oldStatus: StoryStatus | null) {
  if (!oldStatus) return status;

  return statusOrder[Math.max(statusOrder.indexOf(status), statusOrder.indexOf(oldStatus))];
}

export function testsToStatusUpdate<T extends StatusTestFieldsFragment>(
  tests: readonly T[]
): StatusUpdate {
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
