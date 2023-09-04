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
    result: null,
    viewport: 1600,
    comparisons: [
      makeComparison({
        id: "141",
        browser: Browser.Chrome,
        viewport: 1600,
        result: null,
      }),
      makeComparison({
        id: "142",
        browser: Browser.Safari,
        viewport: 1600,
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
      "status": "IN_PROGRESS",
      "modeResults": [
        {
          "result": "EQUAL",
          "viewport": {
            "id": "_1200",
            "isDefault": true,
            "name": "1200px",
            "width": 1200,
          },
        },
        {
          "result": "CAPTURE_ERROR",
          "viewport": {
            "id": "_800",
            "isDefault": false,
            "name": "800px",
            "width": 800,
          },
        },
        {
          "result": "CHANGED",
          "viewport": {
            "id": "_480",
            "isDefault": false,
            "name": "480px",
            "width": 480,
          },
        },
        {
          "result": "ADDED",
          "viewport": {
            "id": "_1600",
            "isDefault": false,
            "name": "1600px",
            "width": 1600,
          },
        },
      ],
    }
  `);
});
