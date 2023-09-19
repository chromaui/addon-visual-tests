import { ComparisonResult, StoryTestFieldsFragment, TestResult, TestStatus } from "../gql/graphql";
import { aggregateResult } from "./aggregateResult";

function pickStatus(statusCounts: { [K in TestStatus]?: number }) {
  if ((statusCounts[TestStatus.Failed] ?? 0) > 0) return TestStatus.Failed;
  if ((statusCounts[TestStatus.InProgress] ?? 0) > 0) return TestStatus.InProgress;
  if ((statusCounts[TestStatus.Broken] ?? 0) > 0) return TestStatus.Broken;
  if ((statusCounts[TestStatus.Denied] ?? 0) > 0) return TestStatus.Denied;
  if ((statusCounts[TestStatus.Pending] ?? 0) > 0) return TestStatus.Pending;
  if ((statusCounts[TestStatus.Accepted] ?? 0) > 0) return TestStatus.Accepted;
  return TestStatus.Passed;
}

/**
 * Given a list of tests (typically a set of tests across modes for the one story),
 * summarize the vital statistics.
 */
export function summarizeTests(tests: StoryTestFieldsFragment[]) {
  const {
    statusCounts,
    isInProgress,
    changeCount,
    brokenCount,
    resultsByBrowser,
    resultsByViewport,
    viewportInfoById,
  } = tests.reduce<{
    statusCounts: { [K in TestStatus]?: number };
    isInProgress: boolean;
    changeCount: number;
    brokenCount: number;
    resultsByBrowser: Record<string, ComparisonResult | undefined>;
    resultsByViewport: Record<string, ComparisonResult | undefined>;
    viewportInfoById: Record<string, StoryTestFieldsFragment["parameters"]["viewport"]>;
  }>(
    (acc, test) => {
      acc.statusCounts[test.status] = (acc.statusCounts[test.status] || 0) + 1;

      if (test.status === TestStatus.InProgress) {
        acc.isInProgress = true;
      }
      if (test.result && [TestResult.Changed, TestResult.Added].includes(test.result)) {
        acc.changeCount += 1;
      }
      if (test.result && [TestResult.CaptureError, TestResult.SystemError].includes(test.result)) {
        acc.brokenCount += 1;
      }
      test.comparisons?.forEach(({ browser, result }) => {
        acc.resultsByBrowser[browser.id] = aggregateResult([
          result ?? undefined,
          acc.resultsByBrowser[browser.id],
        ]);
      });
      test.comparisons?.forEach(({ viewport, result }) => {
        acc.resultsByViewport[viewport.id] = aggregateResult([
          result ?? undefined,
          acc.resultsByViewport[viewport.id],
        ]);
      });
      acc.viewportInfoById[test.parameters.viewport.id] = test.parameters.viewport;
      return acc;
    },
    {
      statusCounts: {},
      isInProgress: false,
      changeCount: 0,
      brokenCount: 0,
      resultsByBrowser: {},
      resultsByViewport: {},
      viewportInfoById: {},
    }
  );

  // All tests have the same browsers so we can just look at the first
  // TODO -- it's inefficient to get this data on every test when we only need the first.
  // Instead, let's just get it on the build and pass it in
  const browserInfoById = tests.length
    ? Object.fromEntries(tests[0].comparisons.map((c) => [c.browser.id, c.browser]))
    : {};

  const browserResults = Object.entries(resultsByBrowser).map(([id, result]) => ({
    browser: browserInfoById[id],
    result,
  }));
  const modeResults = Object.entries(resultsByViewport).map(([id, result]) => ({
    viewport: viewportInfoById[id],
    result,
  }));

  return {
    status: pickStatus(statusCounts),
    isInProgress,
    changeCount,
    brokenCount,
    browserResults,
    modeResults,
  };
}
