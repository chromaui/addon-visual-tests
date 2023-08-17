import {
  Browser,
  BrowserInfo,
  ComparisonResult,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
  ViewportInfo,
} from "../gql/graphql";

export const makeBrowserInfo = (key: Browser): BrowserInfo => ({
  id: key,
  key,
  name: key.slice(0, 1) + key.slice(1).toLowerCase(),
  version: "<unknown>",
});

export const makeViewportInfo = (width: number): ViewportInfo => ({
  id: `_${width}`,
  name: `${width}px`,
  width,
  isDefault: width === 1200,
});

export const baseCapture: StoryTestFieldsFragment["comparisons"][number]["baseCapture"] = {
  captureImage: {
    imageUrl: "/A.png",
  },
};

export const headCapture: StoryTestFieldsFragment["comparisons"][number]["headCapture"] = {
  captureImage: {
    imageUrl: "/B.png",
  },
};

export const captureDiff: StoryTestFieldsFragment["comparisons"][number]["captureDiff"] = {
  diffImage: {
    imageUrl: "/B-comparison.png",
  },
};

export function makeComparison(options: {
  id?: string;
  browser?: Browser;
  viewport?: number;
  result?: ComparisonResult;
}): StoryTestFieldsFragment["comparisons"][number] {
  const result = options.result || ComparisonResult.Equal;
  return {
    id: options.id || "111",
    browser: makeBrowserInfo(options.browser || Browser.Chrome),
    viewport: makeViewportInfo(options.viewport || 1200),
    result,
    baseCapture,
    headCapture,
    ...(result === ComparisonResult.Changed && { captureDiff }),
  };
}

const testResultToComparisonResult: Record<TestResult, ComparisonResult> = {
  [TestResult.Added]: ComparisonResult.Added,
  [TestResult.Changed]: ComparisonResult.Changed,
  [TestResult.Equal]: ComparisonResult.Equal,
  [TestResult.Removed]: ComparisonResult.Removed,
  [TestResult.CaptureError]: ComparisonResult.CaptureError,
  [TestResult.Fixed]: ComparisonResult.Fixed,
  [TestResult.Skipped]: null, // Shouldn't have any comparisons
  [TestResult.SystemError]: ComparisonResult.SystemError,
};

const testStatusToTestResult: Record<TestStatus, TestResult> = {
  [TestStatus.Failed]: TestResult.SystemError,
  [TestStatus.Broken]: TestResult.CaptureError,
  [TestStatus.Accepted]: TestResult.Changed,
  [TestStatus.Denied]: TestResult.Changed,
  [TestStatus.Pending]: TestResult.Changed,
  [TestStatus.Passed]: TestResult.Equal,
  [TestStatus.InProgress]: null,
};

/**
 * Make a single test with some shorthands to map across browsers
 */
export function makeTest(options: {
  id?: string;
  status?: TestStatus;
  result?: TestResult;
  comparisons?: StoryTestFieldsFragment["comparisons"];
  comparisonResults?: ComparisonResult[];
  browsers?: Browser[];
  viewport?: number;
  storyId?: string;
}): StoryTestFieldsFragment {
  const id = options.id || "11";
  const status = options.status || TestStatus.Passed;
  const result = options.result || testStatusToTestResult[status];

  const viewportWidth = options.viewport || 1200;

  function generateComparisons() {
    if (result === TestResult.Skipped) {
      return [];
    }

    const browsers = options.browsers || [Browser.Chrome];

    if (options.comparisonResults && options.comparisonResults.length !== browsers.length) {
      throw new Error(`You supplied an inconsistent number of browsers/comparisonResults`);
    }
    return browsers.map((browserKey, index) =>
      makeComparison({
        id: `id${index}`,
        browser: browserKey,
        viewport: viewportWidth,
        result: options.comparisonResults?.[index] ?? testResultToComparisonResult[result],
      })
    );
  }

  const comparisons = options.comparisons || generateComparisons();

  return {
    id,
    status,
    result,
    webUrl: `https://www.chromatic.com/test?appId=123&id=${id}`,
    comparisons,
    parameters: { viewport: makeViewportInfo(viewportWidth) },
    story: { storyId: options.storyId || "button--primary" },
  };
}

/**
 * Make a set of tests across viewports for a single story
 */
export function makeTests(options: {
  id?: string;
  storyId?: string;
  browsers?: Browser[];
  viewports: {
    viewport?: number;
    status?: TestStatus;
    result?: TestResult;
    comparisons?: StoryTestFieldsFragment["comparisons"];
    comparisonResults?: ComparisonResult[];
  }[];
}) {
  return options.viewports.map((viewportOptions, index) =>
    makeTest({
      id: `${options.id || "1"}${index}`,
      storyId: options.storyId || "button--primary",
      browsers: options.browsers || [Browser.Chrome],
      ...viewportOptions,
    })
  );
}
