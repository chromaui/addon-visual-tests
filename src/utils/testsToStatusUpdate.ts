import type { API } from 'storybook/internal/manager-api';
import {
  StatusValue,
  type Status,
  type StatusValueType,
  type StoryId,
} from 'storybook/internal/types';

import { ADDON_ID } from '../constants';
import { StatusTestFieldsFragment, TestStatus } from '../gql/graphql';

export const statusMap: Record<TestStatus, StatusValueType> = {
  [TestStatus.Pending]: StatusValue.WARN,
  [TestStatus.Failed]: StatusValue.ERROR,
  [TestStatus.Denied]: StatusValue.ERROR,
  [TestStatus.Broken]: StatusValue.ERROR,
  // TODO: which order, and which value?
  [TestStatus.Accepted]: StatusValue.SUCCESS,
  [TestStatus.InProgress]: StatusValue.PENDING,
  [TestStatus.Passed]: StatusValue.SUCCESS,
};

const statusValueOrder: StatusValueType[] = [
  StatusValue.UNKNOWN,
  StatusValue.PENDING,
  StatusValue.SUCCESS,
  StatusValue.WARN,
  StatusValue.ERROR,
];

function chooseWorseStatusValue(a: StatusValueType, b: StatusValueType) {
  return statusValueOrder[Math.max(statusValueOrder.indexOf(a), statusValueOrder.indexOf(b))];
}

export function testsToStatusUpdate<T extends StatusTestFieldsFragment>(
  tests: readonly T[]
): Status[] {
  const storyIdToStatusValue: Record<StoryId, StatusValueType> = {};
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
  // TODO: migrate this to the new statusStore API
  // const openAddonPanel = () => {
  //   api.setSelectedPanel(PANEL_ID);
  //   api.togglePanel(true);
  // };

  return Object.entries(storyIdToStatusValue).map(([storyId, value]) => ({
    value,
    typeId: ADDON_ID,
    storyId,
    title: 'Visual tests',
    description: 'Chromatic Visual Tests',
  }));
}
