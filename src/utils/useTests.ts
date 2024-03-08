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
  const [selectedBrowserId, setSelectedBrowserId] = useSharedState<string>(SELECTED_BROWSER_ID);
  const [selectedModeName, setSelectedModeName] = useSharedState<string>(SELECTED_MODE_NAME);

  const onSelectBrowser = useCallback(
    ({ id }: BrowserData) => setSelectedBrowserId(id),
    [setSelectedBrowserId]
  );
  const onSelectMode = useCallback(
    ({ name }: ModeData) => setSelectedModeName(name),
    [setSelectedModeName]
  );

  // Select the test based on the following criteria (in order of priority):
  // 1. The first test with changes detected and the mode name matches the one previously selected
  // 2. The first test with changes detected
  // 3. The first test where the mode name matches the one previously selected
  // 4. The first test
  const changedTests = tests.filter(({ status }) => status !== TestStatus.Passed);
  const selectedTest =
    changedTests.find(({ mode }) => mode.name === selectedModeName) ||
    changedTests[0] ||
    tests.find(({ mode }) => mode.name === selectedModeName) ||
    tests[0];
  if (selectedTest?.mode.name !== selectedModeName) {
    setSelectedModeName(selectedTest?.mode.name);
  }
  const selectedComparison =
    selectedTest?.comparisons.find(({ browser }) => browser.id === selectedBrowserId) ||
    selectedTest?.comparisons[0];
  if (selectedComparison?.browser.id !== selectedBrowserId) {
    setSelectedBrowserId(selectedComparison?.browser.id);
  }

  return {
    modeOrder: themeType?.toolbar?.items?.map((item: { title: string }) => item.title),
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectMode,
  };
}
