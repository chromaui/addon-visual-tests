import type { API_StatusUpdate, API_StatusValue, StoryId } from "storybook/internal/types";

import { StatusTestFieldsFragment, TestStatus } from "../gql/graphql";

export const statusMap: Partial<Record<TestStatus, API_StatusValue>> = {
  [TestStatus.Pending]: "warn",
  [TestStatus.Failed]: "error",
  [TestStatus.Denied]: "error",
  [TestStatus.Broken]: "error",
};

const statusOrder: (API_StatusValue | null)[] = [
  null,
  "unknown",
  "pending",
  "success",
  "warn",
  "error",
];
function chooseWorseStatus(status: API_StatusValue | null, oldStatus: API_StatusValue | null) {
  return statusOrder[Math.max(statusOrder.indexOf(status), statusOrder.indexOf(oldStatus))];
}

export function testsToStatusUpdate<T extends StatusTestFieldsFragment>(
  tests: readonly T[]
): API_StatusUpdate {
  const storyIdToStatus: Record<StoryId, API_StatusValue | null> = {};
  tests.forEach((test) => {
    if (!test.story || !test.status) {
      return;
    }
    storyIdToStatus[test.story.storyId] = chooseWorseStatus(
      statusMap[test.status] || null,
      storyIdToStatus[test.story.storyId]
    );
  });
  const update = Object.fromEntries(
    Object.entries(storyIdToStatus).map(([storyId, status]) => [
      storyId,
      status && {
        status,
        title: "Visual Tests",
        description: "Chromatic Visual Tests",
      },
    ])
  );

  return update;
}
