import { useCallback, useState } from "react";

import { BrowserInfo, TestFieldsFragment, ViewportInfo } from "../gql/graphql";

type ViewportData = Pick<ViewportInfo, "id" | "name">;
type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: TestFieldsFragment[]) {
  const [selectedTest, onSelectTest] = useState<TestFieldsFragment>(tests[0]);
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserInfo["id"]>(
    selectedTest.comparisons[0].browser.id
  );
  const selectedComparison = selectedTest.comparisons.find(
    (comparison) => comparison.browser.id === selectedBrowserId
  );
  if (!selectedComparison) {
    throw new Error(`No comparison found with browser id ${selectedBrowserId}`);
  }

  const onSelectViewport = useCallback(
    (viewport: ViewportData) => {
      const newSelectedTest = tests.find(
        ({ parameters }) => parameters.viewport.id === viewport.id
      );
      if (!newSelectedTest) throw new Error(`No test found with viewport ${viewport.id}`);
      onSelectTest(newSelectedTest);
    },
    [tests]
  );
  const onSelectBrowser = useCallback(
    (browser: BrowserData) => onSelectBrowserId(browser.id),
    [onSelectBrowserId]
  );
  return {
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectViewport,
  };
}
