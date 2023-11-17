import { Browser, ComparisonResult, TestResult, TestStatus } from "../gql/graphql";
import { makeComparison, makeTest } from "./storyData";
import { summarizeTests } from "./summarizeTests";

jest.mock("react", () => ({
  useState: jest.fn((x: any) => [x, jest.fn()]),
  useCallback: jest.fn((f: any) => f),
}));

const tests = [
  makeTest({
    id: "11",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: "12",
    status: TestStatus.Broken,
    result: TestResult.CaptureError,
    viewport: 800,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: "13",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    viewport: 480,
    browsers: [Browser.Chrome, Browser.Safari],
  }),
  makeTest({
    id: "14",
    status: TestStatus.InProgress,
    result: undefined,
    viewport: 1600,
    comparisons: [
      makeComparison({
        id: "141",
        browser: Browser.Chrome,
        result: undefined,
      }),
      makeComparison({
        id: "142",
        browser: Browser.Safari,
        result: ComparisonResult.Added,
      }),
    ],
  }),
];

it("Calculates static information correctly", () => {
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
