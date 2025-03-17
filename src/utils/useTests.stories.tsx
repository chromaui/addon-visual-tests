import React, { useEffect } from 'react';
import { expect, waitFor } from 'storybook/test';

import { SELECTED_BROWSER_ID, SELECTED_MODE_NAME } from '../constants';
import { ComparisonResult, StoryTestFieldsFragment } from '../gql/graphql';
import { playAll } from './playAll';
import { useSharedState } from './useSharedState';
import { useTests } from './useTests';

const UseTests = ({ tests }: { tests: StoryTestFieldsFragment[] }) => {
  const data = useTests(tests);
  const [globalMode] = useSharedState<string>(SELECTED_MODE_NAME);
  const [globalBrowser] = useSharedState<string>(SELECTED_BROWSER_ID);
  const json = JSON.stringify({ ...data, globalMode, globalBrowser }, null, 2);
  return <pre key={json}>{json}</pre>;
};

const Component = ({
  tests,
  selectedMode,
  selectedBrowser,
}: {
  tests: StoryTestFieldsFragment[];
  selectedMode?: string;
  selectedBrowser?: string;
}) => {
  const [initialized, setInitialized] = React.useState(false);
  const setMode = useSharedState<string>(SELECTED_MODE_NAME)[1];
  const setBrowser = useSharedState<string>(SELECTED_BROWSER_ID)[1];

  useEffect(() => {
    if (initialized) return;
    setMode(selectedMode);
    setBrowser(selectedBrowser);
    setInitialized(true);
  }, [initialized, selectedBrowser, selectedMode, setBrowser, setMode]);

  return initialized && <UseTests tests={tests} />;
};

const expectData = (expected: any) =>
  playAll(async ({ canvasElement }) => {
    const data = await waitFor(() => JSON.parse(canvasElement.textContent as any));
    await expect(data).toEqual(expected);
  });

const chrome = { browser: { id: 'chrome' }, result: ComparisonResult.Equal };
const safari = { browser: { id: 'safari' }, result: ComparisonResult.Equal };
const chromeChanged = { browser: { id: 'chrome' }, result: ComparisonResult.Changed };
const safariChanged = { browser: { id: 'safari' }, result: ComparisonResult.Changed };

const alpha = { mode: { name: 'A' }, comparisons: [chrome] };
const bravo = { mode: { name: 'B' }, comparisons: [chrome, safari] };
const charlie = { mode: { name: 'C' }, comparisons: [chromeChanged] };
const delta = { mode: { name: 'D' }, comparisons: [chrome, safariChanged] };

export default {
  component: Component,
  args: {
    tests: [alpha, bravo, charlie, delta],
  },
  parameters: {
    chromatic: {
      modes: {
        Light: { theme: 'light', viewport: 'default' },
      },
    },
  },
};

export const NoTests = {
  args: {
    tests: [],
  },
  play: expectData({}),
};

export const SelectsFirstTest = {
  args: {
    tests: [alpha, bravo], // Only unchanged tests
  },
  play: expectData({
    globalMode: 'A',
    globalBrowser: 'chrome',
    selectedTest: alpha,
    selectedComparison: chrome,
  }),
};

export const SelectsFirstTestMatchingMode = {
  args: {
    tests: [alpha, bravo], // Only unchanged tests
    selectedMode: 'B',
  },
  play: expectData({
    globalMode: 'B',
    globalBrowser: 'chrome',
    selectedTest: bravo,
    selectedComparison: chrome,
  }),
};

export const SelectsFirstChangedTest = {
  play: expectData({
    globalMode: 'C',
    globalBrowser: 'chrome',
    selectedTest: charlie,
    selectedComparison: chromeChanged,
  }),
};

export const SelectsFirstChangedComparisonMatchingMode = {
  args: {
    selectedMode: 'D',
  },
  play: expectData({
    globalMode: 'D',
    globalBrowser: 'safari',
    selectedTest: delta,
    selectedComparison: safariChanged,
  }),
};

export const SelectsFirstChangedTestIgnoringBrowser = {
  args: {
    selectedBrowser: 'safari',
  },
  play: expectData({
    globalMode: 'C',
    globalBrowser: 'chrome',
    selectedTest: charlie,
    selectedComparison: chromeChanged,
  }),
};

export const SelectsFirstChangedTestMatchingBrowser = {
  args: {
    tests: [alpha, bravo, delta, charlie],
  },
  play: expectData({
    globalMode: 'D',
    globalBrowser: 'safari',
    selectedTest: delta,
    selectedComparison: safariChanged,
  }),
};
