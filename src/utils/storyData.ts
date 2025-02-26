import {
  Browser,
  BrowserInfo,
  ComparisonResult,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
} from '../gql/graphql';

export const makeBrowserInfo = (key: Browser): BrowserInfo => ({
  id: key,
  key,
  name: key.slice(0, 1) + key.slice(1).toLowerCase(),
  version: '<unknown>',
});

export const baseCapture: StoryTestFieldsFragment['comparisons'][number]['baseCapture'] = {
  captureImage: {
    imageUrl: '/A.png',
    imageWidth: 880,
    imageHeight: 280,
  },
};

export const headCapture: StoryTestFieldsFragment['comparisons'][number]['headCapture'] = {
  captureImage: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    imageUrl: '/B.png',
    imageWidth: 880,
    imageHeight: 280,
    thumbnailUrl: '/B.png',
  },
};

export const captureDiff: StoryTestFieldsFragment['comparisons'][number]['captureDiff'] = {
  diffImage: {
    imageUrl: '/B-comparison.png',
    imageWidth: 880,
  },
  focusImage: {
    imageUrl: '/B-focus.png',
    imageWidth: 880,
  },
};

export function makeComparison(options: {
  id?: string;
  browser?: Browser;
  result?: ComparisonResult;
  captureError?: NonNullable<
    StoryTestFieldsFragment['comparisons'][number]['headCapture']
  >['captureError'];
  baseCapture?: StoryTestFieldsFragment['comparisons'][number]['baseCapture'];
}): StoryTestFieldsFragment['comparisons'][number] {
  const {
    captureError,
    result = ComparisonResult.Equal,
    baseCapture: baseCaptureOverride,
  } = options;
  return {
    id: options.id || '111',
    browser: makeBrowserInfo(options.browser || Browser.Chrome),
    result,
    baseCapture: baseCaptureOverride !== undefined ? baseCaptureOverride : baseCapture,
    headCapture: captureError ? { ...headCapture, captureError } : headCapture,
    ...((result === ComparisonResult.Changed || captureError?.kind === 'INTERACTION_FAILURE') && {
      captureDiff,
    }),
  };
}

const testResultToComparisonResult: Record<TestResult, ComparisonResult | undefined> = {
  [TestResult.Added]: ComparisonResult.Added,
  [TestResult.Changed]: ComparisonResult.Changed,
  [TestResult.Equal]: ComparisonResult.Equal,
  [TestResult.Removed]: ComparisonResult.Removed,
  [TestResult.CaptureError]: ComparisonResult.CaptureError,
  [TestResult.Fixed]: ComparisonResult.Fixed,
  [TestResult.Skipped]: undefined, // Shouldn't have any comparisons
  [TestResult.SystemError]: ComparisonResult.SystemError,
};

const testStatusToTestResult: Record<TestStatus, TestResult | undefined> = {
  [TestStatus.Failed]: TestResult.SystemError,
  [TestStatus.Broken]: TestResult.CaptureError,
  [TestStatus.Accepted]: TestResult.Changed,
  [TestStatus.Denied]: TestResult.Changed,
  [TestStatus.Pending]: TestResult.Changed,
  [TestStatus.Passed]: TestResult.Equal,
  [TestStatus.InProgress]: undefined,
};

/**
 * Make a single test with some shorthands to map across browsers
 */
export function makeTest(options: {
  id?: string;
  status?: TestStatus;
  result?: TestResult;
  comparisons?: StoryTestFieldsFragment['comparisons'];
  comparisonResults?: ComparisonResult[];
  browsers?: Browser[];
  viewport?: number;
  storyId?: string;
  captureError?: NonNullable<
    StoryTestFieldsFragment['comparisons'][number]['headCapture']
  >['captureError'];
}): StoryTestFieldsFragment {
  const id = options.id || '11';
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
        result:
          options.comparisonResults?.[index] ?? (result && testResultToComparisonResult[result]),
        captureError: options.captureError,
      })
    );
  }

  function generateStory(storyId: string) {
    const [rawComponentName, rawStoryName] = storyId.split('--');
    return {
      storyId,
      name: rawStoryName[0].toUpperCase() + rawStoryName.slice(1),
      component: {
        name: rawComponentName[0].toUpperCase() + rawComponentName.slice(1),
      },
    };
  }

  const comparisons = options.comparisons || generateComparisons();

  return {
    id,
    status,
    result,
    webUrl: `https://www.chromatic.com/test?appId=123&id=${id}`,
    comparisons,
    mode: { name: `${viewportWidth}px`, globals: {} },
    story: generateStory(options.storyId || 'button--primary'),
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
    comparisons?: StoryTestFieldsFragment['comparisons'];
    comparisonResults?: ComparisonResult[];
  }[];
}) {
  return options.viewports.map((viewportOptions, index) =>
    makeTest({
      id: `${options.id || '1'}${index}`,
      storyId: options.storyId || 'button--primary',
      browsers: options.browsers || [Browser.Chrome],
      ...viewportOptions,
    })
  );
}
