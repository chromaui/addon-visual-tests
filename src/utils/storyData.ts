import {
  Browser,
  BrowserInfo,
  ComparisonResult,
  TestFieldsFragment,
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

export const headCapture: TestFieldsFragment["comparisons"][number]["headCapture"] = {
  captureImage: {
    imageUrl: "/B.png",
  },
};

export const captureDiff: TestFieldsFragment["comparisons"][number]["captureDiff"] = {
  diffImage: {
    imageUrl: "/B-comparison.png",
  },
};

export function makeComparison(options: {
  id?: string;
  browser?: Browser;
  viewport?: number;
  result?: ComparisonResult;
}): TestFieldsFragment["comparisons"][number] {
  const result = options.result || ComparisonResult.Equal;
  return {
    id: options.id || "111",
    browser: makeBrowserInfo(options.browser || Browser.Chrome),
    viewport: makeViewportInfo(options.viewport || 1200),
    result,
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

export function makeTest(options: {
  id?: string;
  status?: TestStatus;
  result?: TestResult;
  comparisons?: TestFieldsFragment["comparisons"];
  browsers?: Browser[];
  viewport?: number;
  storyId?: string;
}): TestFieldsFragment {
  const id = options.id || "11";
  const result = options.result || TestResult.Equal;

  const viewportWidth = options.viewport || 1200;
  const comparisons =
    options.comparisons ||
    (options.browsers || [Browser.Chrome]).map((browserKey, index) =>
      makeComparison({
        id: `id${index}`,
        browser: browserKey,
        viewport: viewportWidth,
        result: testResultToComparisonResult[result],
      })
    );
  return {
    id,
    status: options.status || TestStatus.Passed,
    result,
    webUrl: `https://www.chromatic.com/test?appId=123&id=${id}`,
    comparisons,
    parameters: { viewport: makeViewportInfo(viewportWidth) },
    story: { storyId: options.storyId || "button--primary" },
  };
}
