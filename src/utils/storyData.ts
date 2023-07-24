import {
  Browser,
  ComparisonResult,
  TestFieldsFragment,
  TestResult,
  TestStatus,
} from "../gql/graphql";

export const browser = (key: Browser) => ({
  id: key,
  key,
  name: key.slice(0, 1) + key.slice(1).toLowerCase(),
  version: "<unknown>",
});

export const viewport = (width: number) => ({
  id: `_${width}`,
  name: `${width}px`,
  width,
  isDefault: width === 1200,
});

export const headCapture = {
  captureImage: {
    imageUrl: "/B.png",
  },
};

export const captureDiff = {
  diffImage: {
    imageUrl: "/B-comparison.png",
  },
};

export function comparison(options: {
  id?: string;
  browser?: Browser;
  viewport?: number;
  result?: ComparisonResult;
}) {
  return {
    id: options.id || "111",
    browser: browser(options.browser || Browser.Chrome),
    viewport: viewport(options.viewport || 1200),
    result: options.result || ComparisonResult.Equal,
    headCapture,
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

export function test(options: {
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
      comparison({
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
    parameters: { viewport: viewport(viewportWidth) },
    story: { storyId: options.storyId || "button--primary" },
  };
}
