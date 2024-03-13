import { useGlobals, useGlobalTypes } from "@storybook/manager-api";
import { useCallback, useMemo, useRef, useState } from "react";

import { SELECTED_BROWSER_ID, SELECTED_MODE_NAME } from "../constants";
import {
  BrowserInfo,
  ComparisonResult,
  StoryTestFieldsFragment,
  TestMode,
  TestStatus,
} from "../gql/graphql";
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
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 *
 * Select the initial test mode based on the following criteria (in order of priority):
 * 1. The first test with changes detected and the mode name matches the one previously selected
 * 2. The first test with changes detected
 * 3. The first test where the mode name matches the one previously selected
 * 4. The first test
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const themeType = useGlobalValue("theme")[1];

  const [globalSelectedModeName, setGlobalSelectedModeName] =
    useSharedState<string>(SELECTED_MODE_NAME);
  const [globalSelectedBrowserId, setGlobalSelectedBrowserId] =
    useSharedState<string>(SELECTED_BROWSER_ID);

  const selectedModeName = useRef(globalSelectedModeName);
  const selectedBrowserId = useRef(globalSelectedBrowserId);

  if (tests?.length && (!selectedModeName.current || !selectedBrowserId.current)) {
    const changedTests = tests.filter((test) => test.comparisons.some(hasChanges));
    const candidateTests = changedTests.length ? changedTests : tests;
    const selectedTest =
      candidateTests.find((t) => t.mode.name === globalSelectedModeName) || candidateTests[0];

    const changedComparisons = selectedTest.comparisons.filter(hasChanges);
    const candidateComparisons = changedComparisons.length
      ? changedComparisons
      : selectedTest.comparisons;
    const selectedComparison =
      candidateComparisons.find((c) => c.browser.id === globalSelectedBrowserId) ||
      candidateComparisons[0];

    selectedModeName.current = selectedTest.mode.name;
    selectedBrowserId.current = selectedComparison.browser.id;
  }

  const selectedTest = tests.find(({ mode }) => mode.name === selectedModeName.current) || tests[0];
  const selectedComparison =
    selectedTest?.comparisons.find(({ browser }) => browser.id === selectedBrowserId.current) ||
    selectedTest?.comparisons[0];

  if (selectedTest?.mode.name !== globalSelectedModeName) {
    setGlobalSelectedModeName(selectedTest?.mode.name);
  }
  if (selectedComparison?.browser.id !== globalSelectedBrowserId) {
    setGlobalSelectedBrowserId(selectedComparison?.browser.id);
  }

  return {
    modeOrder: themeType?.toolbar?.items?.map((item: { title: string }) => item.title),
    selectedTest,
    selectedComparison,
    onSelectBrowser: useCallback(
      (browser: BrowserData) => setGlobalSelectedBrowserId(browser.id),
      [setGlobalSelectedBrowserId]
    ),
    onSelectMode: useCallback(
      (mode: ModeData) => setGlobalSelectedModeName(mode.name),
      [setGlobalSelectedModeName]
    ),
  };
}
