import { useCallback, useState } from "react";

import { BrowserInfo, StoryTestFieldsFragment, TestMode } from "../gql/graphql";

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;
type ModeData = Pick<TestMode, "name">;

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserData["id"]>(
    tests[0]?.comparisons[0].browser.id
  );
  const [selectedModeName, onSelectModeName] = useState<ModeData["name"]>(tests[0]?.mode.name);

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
