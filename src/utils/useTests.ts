import { useGlobals, useGlobalTypes } from "@storybook/manager-api";
import { useCallback, useState } from "react";

import { SELECTED_BROWSER_ID, SELECTED_MODE_NAME } from "../constants";
import { BrowserInfo, ComparisonResult, StoryTestFieldsFragment, TestMode } from "../gql/graphql";
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

const hasChanges = ({ result }: StoryTestFieldsFragment["comparisons"][number]) =>
  result !== ComparisonResult.Equal && result !== ComparisonResult.Fixed;

/**
 * Select the initial test based on the following criteria (in order of priority):
 * 1. The first test with changes detected and the mode name matches the global one
 * 2. The first test with changes detected
 * 3. The first test where the mode name matches the global one
 * 4. The first test
 */
export const getMostUsefulTest = (
  tests: StoryTestFieldsFragment[],
  modeName?: ModeData["name"]
): StoryTestFieldsFragment => {
  const changedTests = tests.filter((test) => test.comparisons.some(hasChanges));
  const candidateTests = changedTests.length ? changedTests : tests;
  const test = candidateTests.find((t) => t.mode.name === modeName) || candidateTests[0];
  return test;
};

/**
 * Select the initial comparison based on the following criteria (in order of priority):
 * 1. The comparison with changes detected and the browser id matches the global one
 * 2. The first comparison with changes detected
 * 3. The first comparison where the browser id matches the global one
 * 4. The first comparison
 */
export const getMostUsefulComparison = (
  comparisons: StoryTestFieldsFragment["comparisons"],
  browserId?: BrowserData["id"]
): StoryTestFieldsFragment["comparisons"][number] => {
  const changedComparisons = comparisons.filter(hasChanges);
  const candidateComparisons = changedComparisons.length ? changedComparisons : comparisons;
  const comparison =
    candidateComparisons.find((c) => c.browser.id === browserId) || candidateComparisons[0];
  return comparison;
};

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [initialRender, setInitialRender] = useState(true);
  const themeType = useGlobalValue("theme")[1];

  const [selectedModeName, setSelectedModeName] = useSharedState<string>(SELECTED_MODE_NAME);
  const [selectedBrowserId, setSelectedBrowserId] = useSharedState<string>(SELECTED_BROWSER_ID);

  let selectedTest;
  let selectedComparison;
  if (tests.length) {
    selectedTest = initialRender
      ? getMostUsefulTest(tests, selectedModeName)
      : tests.find(({ mode }) => mode.name === selectedModeName) || tests[0];
    selectedComparison = initialRender
      ? getMostUsefulComparison(selectedTest.comparisons, selectedBrowserId)
      : selectedTest?.comparisons.find(({ browser }) => browser.id === selectedBrowserId) ||
        selectedTest?.comparisons[0];

    if (initialRender) {
      if (selectedModeName !== selectedTest?.mode.name) {
        setSelectedModeName(selectedTest?.mode.name);
      }
      if (selectedBrowserId !== selectedComparison?.browser.id) {
        setSelectedBrowserId(selectedComparison?.browser.id);
      }
      setInitialRender(false);
    }
  }

  return {
    modeOrder: themeType?.toolbar?.items?.map((item: { title: string }) => item.title),
    selectedTest,
    selectedComparison,
    onSelectBrowser: useCallback(
      (browser: BrowserData) => setSelectedBrowserId(browser.id),
      [setSelectedBrowserId]
    ),
    onSelectMode: useCallback(
      (mode: ModeData) => setSelectedModeName(mode.name),
      [setSelectedModeName]
    ),
  };
}
