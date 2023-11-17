import { useGlobals } from "@storybook/manager-api";
import { useCallback, useState } from "react";

import { BrowserInfo, StoryTestFieldsFragment, TestMode, TestStatus } from "../gql/graphql";

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;
type ModeData = Pick<TestMode, "name">;

const useGlobalValue = (key: string) => {
  try {
    return useGlobals()[0][key];
  } catch (e) {
    return null;
  }
};

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const theme = useGlobalValue("theme");
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserData["id"]>(() => {
    const test = tests.find(({ status }) => status !== TestStatus.Passed) || tests[0];
    return test?.comparisons[0]?.browser.id;
  });
  const [selectedModeName, onSelectModeName] = useState<ModeData["name"]>(() => {
    const changed = tests.filter(({ status }) => status !== TestStatus.Passed);
    const candidates = changed.length ? changed : tests;
    const test = candidates.find(({ mode }) => mode.globals.theme === theme) || candidates[0];
    return test?.mode.name;
  });

  const onSelectBrowser = useCallback(({ id }: BrowserData) => onSelectBrowserId(id), []);
  const onSelectMode = useCallback(({ name }: ModeData) => onSelectModeName(name), []);

  const selectedTest = tests.find(({ mode }) => mode.name === selectedModeName) || tests[0];
  const selectedComparison =
    selectedTest?.comparisons.find(({ browser }) => browser.id === selectedBrowserId) ||
    selectedTest?.comparisons[0];

  return {
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectMode,
  };
}
