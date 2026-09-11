import { expect, it, vi } from 'vitest';

import {
  Browser,
  ComparisonResult,
  TestIgnoreReason,
  TestResult,
  TestStatus,
} from '../gql/graphql';
import { makeComparison, makeTest } from './storyData';
import { getIgnoreBadgeLabel, shouldShowUnstableBadge, summarizeTests } from './summarizeTests';

vi.mock('react', () => ({
  useState: vi.fn((x: any) => [x, vi.fn()]),
  useCallback: vi.fn((f: any) => f),
}));

const tests = [
  makeTest({
    id: '11',
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: '12',
    status: TestStatus.Broken,
    result: TestResult.CaptureError,
    viewport: 800,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: '13',
    status: TestStatus.Pending,
    result: TestResult.Changed,
    viewport: 480,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: '14',
    status: TestStatus.InProgress,
    result: undefined,
    viewport: 1600,
    comparisons: [
      makeComparison({
        id: '141',
        browser: Browser.Chrome,
        result: undefined,
      }),
      makeComparison({
        id: '142',
        browser: Browser.Safari,
        result: ComparisonResult.Added,
      }),
    ],
  }),
];

it('Calculates static information correctly', () => {
  const { status, isInProgress, changeCount, brokenCount, browserResults, modeResults } =
    summarizeTests(tests);

  expect({
    status,
    isInProgress,
    changeCount,
    brokenCount,
    browserResults,
    modeResults,
  }).toMatchInlineSnapshot(`
    {
      "brokenCount": 1,
      "browserResults": [
        {
          "browser": {
            "id": "CHROME",
            "key": "CHROME",
            "name": "Chrome",
            "version": "<unknown>",
          },
          "result": "CAPTURE_ERROR",
        },
        {
          "browser": {
            "id": "SAFARI",
            "key": "SAFARI",
            "name": "Safari",
            "version": "<unknown>",
          },
          "result": "CAPTURE_ERROR",
        },
      ],
      "changeCount": 1,
      "isInProgress": true,
      "modeResults": [
        {
          "mode": {
            "globals": {},
            "name": "1200px",
          },
          "result": "EQUAL",
        },
        {
          "mode": {
            "globals": {},
            "name": "800px",
          },
          "result": "CAPTURE_ERROR",
        },
        {
          "mode": {
            "globals": {},
            "name": "480px",
          },
          "result": "CHANGED",
        },
        {
          "mode": {
            "globals": {},
            "name": "1600px",
          },
          "result": "ADDED",
        },
      ],
      "status": "IN_PROGRESS",
    }
  `);
});

const ignored = (status = TestStatus.Ignored, ignoreReason = TestIgnoreReason.Manual) =>
  makeTest({ id: '2', status, result: TestResult.Changed, ignoreReason, viewport: 800 });

it('does not count ignored tests towards changes or errors', () => {
  const { status, changeCount, brokenCount } = summarizeTests([
    makeTest({ id: '1', status: TestStatus.Passed }),
    ignored(),
    makeTest({
      id: '3',
      status: TestStatus.Ignored,
      result: TestResult.CaptureError,
      viewport: 480,
    }),
  ]);
  expect({ status, changeCount, brokenCount }).toEqual({
    status: TestStatus.Passed,
    changeCount: 0,
    brokenCount: 0,
  });
});

it('ranks ignored below accepted and passed but summarizes all-ignored stories as ignored', () => {
  expect(summarizeTests([makeTest({ status: TestStatus.Accepted }), ignored()]).status).toBe(
    TestStatus.Accepted
  );
  expect(summarizeTests([makeTest({ status: TestStatus.Pending }), ignored()]).status).toBe(
    TestStatus.Pending
  );
  expect(
    summarizeTests([ignored(), ignored(TestStatus.Ignored, TestIgnoreReason.Quarantine)]).status
  ).toBe(TestStatus.Ignored);
});

it('treats the deprecated UNSTABLE status as ignored', () => {
  const { status, changeCount } = summarizeTests([ignored(TestStatus.Unstable)]);
  expect({ status, changeCount }).toEqual({ status: TestStatus.Ignored, changeCount: 0 });
});

it('labels the ignore badge by reason', () => {
  const label = (status: TestStatus, ignoreReason: TestIgnoreReason | null) =>
    getIgnoreBadgeLabel({ status, ignoreReason });

  expect(getIgnoreBadgeLabel(undefined)).toBeUndefined();
  expect(label(TestStatus.Pending, null)).toBeUndefined();
  expect(label(TestStatus.Ignored, null)).toBe('Ignored');
  expect(label(TestStatus.Ignored, TestIgnoreReason.Manual)).toBe('Ignored');
  expect(label(TestStatus.Ignored, TestIgnoreReason.Unstable)).toBe('Auto-ignored');
  expect(label(TestStatus.Unstable, TestIgnoreReason.Unstable)).toBe('Auto-ignored');
  expect(label(TestStatus.Ignored, TestIgnoreReason.Quarantine)).toBe('Quarantined');

  // Quarantine outlives acceptance; other ignore reasons do not.
  expect(label(TestStatus.Accepted, TestIgnoreReason.Quarantine)).toBe('Quarantined');
  expect(label(TestStatus.Accepted, TestIgnoreReason.Manual)).toBeUndefined();
  expect(label(TestStatus.Accepted, TestIgnoreReason.Unstable)).toBeUndefined();
});

it('shows the Unstable badge from isUnstable, except when auto-ignored', () => {
  expect(shouldShowUnstableBadge(undefined)).toBe(false);
  expect(shouldShowUnstableBadge({ isUnstable: false, ignoreReason: null })).toBe(false);
  expect(shouldShowUnstableBadge({ isUnstable: true, ignoreReason: null })).toBe(true);
  expect(
    shouldShowUnstableBadge({ isUnstable: true, ignoreReason: TestIgnoreReason.Quarantine })
  ).toBe(true);
  expect(shouldShowUnstableBadge({ isUnstable: true, ignoreReason: TestIgnoreReason.Manual })).toBe(
    true
  );
  // Mirrors the webapp: auto-ignored unstable tests already have an Auto-ignored badge.
  expect(
    shouldShowUnstableBadge({ isUnstable: true, ignoreReason: TestIgnoreReason.Unstable })
  ).toBe(false);
});
