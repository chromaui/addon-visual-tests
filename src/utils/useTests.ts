import { useCallback, useState } from "react";

import { BrowserInfo, StoryTestFieldsFragment, ViewportInfo } from "../gql/graphql";

type ViewportData = Pick<ViewportInfo, "id" | "name">;
type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserData["id"]>(
    tests[0].comparisons[0].browser.id
  );
  const [selectedViewportId, onSelectViewportId] = useState<ViewportData["id"]>(
    tests[0].comparisons[0].viewport.id
  );

  const onSelectBrowser = useCallback(({ id }: BrowserData) => onSelectBrowserId(id), []);
  const onSelectViewport = useCallback(({ id }: ViewportData) => onSelectViewportId(id), []);

  const selectedTest =
    tests.find(({ parameters }) => parameters.viewport.id === selectedViewportId) || tests[0];

  const selectedComparison =
    selectedTest.comparisons.find(({ browser }) => browser.id === selectedBrowserId) ||
    selectedTest.comparisons[0];

  return {
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectViewport,
  };
}
