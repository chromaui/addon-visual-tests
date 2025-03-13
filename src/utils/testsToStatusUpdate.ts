import { type Status, type StatusValue, type StoryId } from 'storybook/internal/types';

import { ADDON_ID } from '../constants';
import { StatusTestFieldsFragment, TestStatus } from '../gql/graphql';

export const statusMap: Record<TestStatus, StatusValue> = {
  [TestStatus.Pending]: 'status-value:warning',
  [TestStatus.Failed]: 'status-value:error',
  [TestStatus.Denied]: 'status-value:error',
  [TestStatus.Broken]: 'status-value:error',
  [TestStatus.InProgress]: 'status-value:pending',
  [TestStatus.Accepted]: 'status-value:success',
  [TestStatus.Passed]: 'status-value:success',
};

const statusValueOrder: StatusValue[] = [
  'status-value:unknown',
  'status-value:pending',
  'status-value:success',
  'status-value:warning',
  'status-value:error',
];

function chooseWorseStatusValue(a: StatusValue, b: StatusValue) {
  return statusValueOrder[Math.max(statusValueOrder.indexOf(a), statusValueOrder.indexOf(b))];
}

export function testsToStatusUpdate<T extends StatusTestFieldsFragment>(
  tests: readonly T[]
): Status[] {
  const storyIdToStatusValue: Record<StoryId, StatusValue> = {};
  tests?.forEach((test) => {
    if (!test.story || !test.status) {
      return;
    }
    const existingStoryStatusValue = storyIdToStatusValue[test.story.storyId];
    if (!existingStoryStatusValue) {
      storyIdToStatusValue[test.story.storyId] = statusMap[test.status];
      return;
    }
    storyIdToStatusValue[test.story.storyId] = chooseWorseStatusValue(
      existingStoryStatusValue,
      statusMap[test.status]
    );
  });

  return Object.entries(storyIdToStatusValue).map(([storyId, value]) => ({
    value,
    typeId: ADDON_ID,
    storyId,
    title: 'Visual tests',
    description: 'Chromatic Visual Tests',
  }));
}
