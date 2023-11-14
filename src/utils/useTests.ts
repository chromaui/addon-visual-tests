import { useCallback, useState } from "react";

import { BrowserInfo, StoryTestFieldsFragment, TestMode, TestStatus } from "../gql/graphql";

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;
type ModeData = Pick<TestMode, "name">;

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserData["id"]>(() => {
    const test = tests.find(({ status }) => status !== TestStatus.Passed) || tests[0];
    return test?.comparisons[0]?.browser.id;
  });
  const [selectedModeName, onSelectModeName] = useState<ModeData["name"]>(() => {
    const test = tests.find(({ status }) => status !== TestStatus.Passed) || tests[0];
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
