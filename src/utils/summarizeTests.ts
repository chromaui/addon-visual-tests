import {
  ComparisonResult,
  StoryTestFieldsFragment,
  TestIgnoreReason,
  TestResult,
  TestStatus,
} from '../gql/graphql';
import { aggregateResult } from './aggregateResult';

/** `UNSTABLE` is deprecated in favor of `IGNORED` (with `ignoreReason: UNSTABLE`); treat it the same. */
export const isIgnored = (status: TestStatus) =>
  status === TestStatus.Ignored || status === TestStatus.Unstable;

// Mirrors the webapp: quarantined tests show "Quarantined", auto-ignored (unstable) tests show
// "Auto-ignored", and everything else that is ignored shows "Ignored".
const ignoreBadgeLabels: Record<TestIgnoreReason, string> = {
  [TestIgnoreReason.Quarantine]: 'Quarantined',
  [TestIgnoreReason.Unstable]: 'Auto-ignored',
  [TestIgnoreReason.Manual]: 'Ignored',
};

/**
 * Badge label describing the ignore state of a single (selected) test. A quarantined test keeps its
 * badge even once accepted (the story is still quarantined); other ignore reasons only apply while
 * the test status is still IGNORED.
 */
export function getIgnoreBadgeLabel(
  test?: Pick<StoryTestFieldsFragment, 'status' | 'ignoreReason'>
) {
  if (!test) return undefined;
  if (test.ignoreReason === TestIgnoreReason.Quarantine) return ignoreBadgeLabels.QUARANTINE;
  if (!isIgnored(test.status)) return undefined;
  return ignoreBadgeLabels[test.ignoreReason ?? TestIgnoreReason.Manual];
}

// Ignored comes last: any reviewed/passed mode outranks an ignored one, so a story only summarizes
// as Ignored when every one of its tests is ignored.
function pickStatus(statusCounts: { [K in TestStatus]?: number }) {
  if ((statusCounts[TestStatus.Failed] ?? 0) > 0) return TestStatus.Failed;
  if ((statusCounts[TestStatus.InProgress] ?? 0) > 0) return TestStatus.InProgress;
  if ((statusCounts[TestStatus.Broken] ?? 0) > 0) return TestStatus.Broken;
  if ((statusCounts[TestStatus.Denied] ?? 0) > 0) return TestStatus.Denied;
  if ((statusCounts[TestStatus.Pending] ?? 0) > 0) return TestStatus.Pending;
  if ((statusCounts[TestStatus.Accepted] ?? 0) > 0) return TestStatus.Accepted;
  if ((statusCounts[TestStatus.Passed] ?? 0) > 0) return TestStatus.Passed;
  if ((statusCounts[TestStatus.Ignored] ?? 0) > 0) return TestStatus.Ignored;
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
    resultsByMode,
    modesByName,
  } = tests.reduce<{
    statusCounts: { [K in TestStatus]?: number };
    isInProgress: boolean;
    changeCount: number;
    brokenCount: number;
    resultsByBrowser: Record<string, ComparisonResult | undefined>;
    resultsByMode: Record<string, ComparisonResult | undefined>;
    modesByName: Record<string, StoryTestFieldsFragment['mode']>;
  }>(
    (acc, test) => {
      const status = isIgnored(test.status) ? TestStatus.Ignored : test.status;
      acc.statusCounts[status] = (acc.statusCounts[status] || 0) + 1;

      if (status === TestStatus.InProgress) {
        acc.isInProgress = true;
      }
      // Ignored tests don't count towards changes or errors; they don't need review.
      if (status !== TestStatus.Ignored) {
        if (test.result && [TestResult.Changed, TestResult.Added].includes(test.result)) {
          acc.changeCount += 1;
        }
        if (
          test.result &&
          [TestResult.CaptureError, TestResult.SystemError].includes(test.result)
        ) {
          acc.brokenCount += 1;
        }
      }
      test.comparisons?.forEach(({ browser, result }) => {
        acc.resultsByBrowser[browser.id] = aggregateResult([
          result ?? undefined,
          acc.resultsByBrowser[browser.id],
        ]);
      });
      test.comparisons?.forEach(({ result }) => {
        acc.resultsByMode[test.mode.name] = aggregateResult([
          result ?? undefined,
          acc.resultsByMode[test.mode.name],
        ]);
      });
      acc.modesByName[test.mode.name] = test.mode;
      return acc;
    },
    {
      statusCounts: {},
      isInProgress: false,
      changeCount: 0,
      brokenCount: 0,
      resultsByBrowser: {},
      resultsByMode: {},
      modesByName: {},
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
  const modeResults = Object.entries(resultsByMode).map(([name, result]) => ({
    mode: modesByName[name],
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
