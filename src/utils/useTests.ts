import { useGlobals, useGlobalTypes } from "@storybook/manager-api";
import { useCallback, useState } from "react";

import { SELECTED_BROWSER_ID, SELECTED_MODE_NAME } from "../constants";
import { BrowserInfo, StoryTestFieldsFragment, TestMode, TestStatus } from "../gql/graphql";
import { useSharedState } from "./useSharedState";

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;
type ModeData = Pick<TestMode, "name">;

const useGlobalValue = (key: string) => {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return [useGlobals()[0][key], useGlobalTypes()[key]];
  } catch (e) {
    return [null, null];
  }
};

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [theme, themeType] = useGlobalValue("theme");
  const [globalSelectedBrowserId, setGlobalSelectedBrowserId] =
    useSharedState<string>(SELECTED_BROWSER_ID);
  const [globalSelectedModeName, setGlobalSelectedModeName] =
    useSharedState<string>(SELECTED_MODE_NAME);
  const [selectedModeName, setSelectedModeName] = useState<ModeData["name"]>(() => {
    // Select the initial test mode based on the following criteria (in order of priority):
    // 1. The first test with changes detected and the mode name matches the one previously selected
    // 2. The first test with changes detected
    // 3. The first test where the mode name matches the one previously selected
    // 4. The first test
    const changedTests = tests.filter(({ status }) => status !== TestStatus.Passed);
    const candidateTests = changedTests.length ? changedTests : tests;
    const test =
      candidateTests.find(({ mode }) => mode.name === globalSelectedModeName) || candidateTests[0];
    if (test?.mode.name !== globalSelectedModeName) {
      setGlobalSelectedModeName(test?.mode.name);
    }
    return test?.mode.name;
  });

  const onSelectBrowser = useCallback(
    ({ id }: BrowserData) => setGlobalSelectedBrowserId(id),
    [setGlobalSelectedBrowserId]
  );
  const onSelectMode = useCallback(
    ({ name }: ModeData) => {
      setSelectedModeName(name);
      setGlobalSelectedModeName(name);
    },
    [setGlobalSelectedModeName]
  );

  const selectedTest = tests.find(({ mode }) => mode.name === selectedModeName) || tests[0];
  const selectedComparison =
    selectedTest?.comparisons.find(({ browser }) => browser.id === globalSelectedBrowserId) ||
    selectedTest?.comparisons[0];
  if (selectedComparison?.browser.id !== globalSelectedBrowserId) {
    setGlobalSelectedBrowserId(selectedComparison?.browser.id);
  }

  return {
    modeOrder: themeType?.toolbar?.items?.map((item: { title: string }) => item.title),
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectMode,
  };
}
