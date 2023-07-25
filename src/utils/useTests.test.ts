import { useState } from "react";

import { Browser, ComparisonResult, TestResult, TestStatus } from "../gql/graphql";
import { makeBrowserInfo, makeComparison, makeTest } from "./storyData";
import { useTests } from "./useTests";

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
  const { isInProgress, changeCount, brokenCount, browserResults, viewportResults } =
    useTests(tests);

  expect({
    isInProgress,
    changeCount,
    brokenCount,
    browserResults,
    viewportResults,
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
      "viewportResults": [
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

it("Picks and updates selectedTest when choosing viewport", () => {
  const onSelectTest = jest.fn((x) => {});
  jest.mocked(useState).mockImplementationOnce(((x: any) => [x, onSelectTest]) as any);
  const { selectedTest, onSelectViewport } = useTests(tests);

  expect(selectedTest).toEqual(tests[0]);

  onSelectViewport(tests[1].parameters.viewport);
  expect(onSelectTest).toHaveBeenCalledWith(tests[1]);
});

it("Picks and updates selectedComparison when choosing browser", () => {
  const useSelectedTestState = (x: any) => [x, jest.fn()];
  jest.mocked(useState).mockImplementationOnce(useSelectedTestState as any);

  // Mocked implementation of useState, is there a better way to do this?
  let browserId: string;
  const useBrowserIdState = ((initialBrowserId: string) => {
    browserId ??= initialBrowserId;
    return [
      browserId,
      jest.fn((newBrowserId) => {
        browserId = newBrowserId;
      }),
    ];
  }) as any;
  jest.mocked(useState).mockImplementationOnce(useBrowserIdState as any);

  const { selectedComparison, onSelectBrowser } = useTests(tests);
  expect(selectedComparison).toEqual(tests[0].comparisons[0]);

  onSelectBrowser(tests[0].comparisons[1].browser);

  jest.mocked(useState).mockImplementationOnce(useSelectedTestState as any);
  jest.mocked(useState).mockImplementationOnce(useBrowserIdState as any);
  expect(useTests(tests).selectedComparison).toEqual(tests[0].comparisons[1]);
});
