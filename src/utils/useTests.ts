import { useCallback, useState } from "react";

import {
  BrowserInfo,
  ComparisonResult,
  TestFieldsFragment,
  TestResult,
  TestStatus,
  ViewportInfo,
} from "../gql/graphql";
import { aggregateResult } from "./aggregateResult";

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

  const {
    isInProgress,
    changeCount,
    brokenCount,
    resultsByBrowser,
    resultsByViewport,
    viewportInfoById,
  } = tests.reduce(
    (acc, test) => {
      if (test.status === TestStatus.InProgress) {
        acc.isInProgress = true;
      }
      if (test.result === TestResult.Changed) {
        acc.changeCount += 1;
      }
      if (test.result === TestResult.CaptureError || test.result === TestResult.SystemError) {
        acc.brokenCount += 1;
      }
      test.comparisons?.forEach(({ browser, result }) => {
        acc.resultsByBrowser[browser.id] = aggregateResult([
          result,
          acc.resultsByBrowser[browser.id],
        ]);
      });
      test.comparisons?.forEach(({ viewport, result }) => {
        acc.resultsByViewport[viewport.id] = aggregateResult([
          result,
          acc.resultsByViewport[viewport.id],
        ]);
      });
      acc.viewportInfoById[test.parameters.viewport.id] = test.parameters.viewport;
      return acc;
    },
    {
      isInProgress: false,
      changeCount: 0,
      brokenCount: 0,
      resultsByBrowser: {} as Record<string, ComparisonResult>,
      resultsByViewport: {} as Record<string, ComparisonResult>,
      viewportInfoById: {} as Record<string, TestFieldsFragment["parameters"]["viewport"]>,
    }
  );

  // All tests have the same browsers so we can just look at the first
  // TODO -- it's inefficient to get this data on every test when we only need the first.
  // Instead, let's just get it on the build and pass it in
  const browserInfoById = Object.fromEntries(
    tests[0].comparisons.map((c) => [c.browser.id, c.browser])
  );

  const browserResults = Object.entries(resultsByBrowser).map(([id, result]) => ({
    browser: browserInfoById[id],
    result,
  }));
  const viewportResults = Object.entries(resultsByViewport).map(([id, result]) => ({
    viewport: viewportInfoById[id],
    result,
  }));

  return {
    selectedTest,
    selectedComparison,
    isInProgress,
    changeCount,
    brokenCount,
    browserResults,
    onSelectBrowser,
    viewportResults,
    onSelectViewport,
  };
}
