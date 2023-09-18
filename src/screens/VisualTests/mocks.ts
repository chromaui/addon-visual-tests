import {
  AnnouncedBuild,
  Browser,
  BuildResult,
  BuildStatus,
  CaptureErrorKind,
  ComparisonResult,
  CompletedBuild,
  PublishedBuild,
  StartedBuild,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { makeBrowserInfo, makeTest, makeTests } from "../../utils/storyData";

export const passedTests = makeTests({
  browsers: [Browser.Chrome, Browser.Safari],
  viewports: [
    { status: TestStatus.Passed, viewport: 480 },
    { status: TestStatus.Passed, viewport: 800 },
    { status: TestStatus.Passed, viewport: 1200 },
  ],
});

export const pendingTests = makeTests({
  browsers: [Browser.Chrome, Browser.Safari],
  viewports: [
    {
      status: TestStatus.Pending,
      viewport: 480,
      comparisonResults: [ComparisonResult.Changed, ComparisonResult.Equal],
    },
    { status: TestStatus.Passed, viewport: 800 },
    { status: TestStatus.Passed, viewport: 1200 },
  ],
});

export const inProgressTests = makeTests({
  browsers: [Browser.Chrome, Browser.Safari],
  viewports: [
    {
      status: TestStatus.Pending,
      viewport: 480,
      comparisonResults: [ComparisonResult.Changed, ComparisonResult.Equal],
    },
    { status: TestStatus.Passed, viewport: 800 },
    { status: TestStatus.InProgress, viewport: 1200 },
  ],
});

export const acceptedTests = makeTests({
  browsers: [Browser.Chrome, Browser.Safari],
  viewports: [
    {
      status: TestStatus.Accepted,
      viewport: 480,
      comparisonResults: [ComparisonResult.Changed, ComparisonResult.Equal],
    },
    { status: TestStatus.Passed, viewport: 800 },
    { status: TestStatus.Passed, viewport: 1200 },
  ],
});

export const brokenTests = inProgressTests.map((test) => ({
  ...test,
  status: TestStatus.Broken,
  result: TestResult.CaptureError,
  comparisons: test.comparisons.map((comparison) => ({
    ...comparison,
    headCapture: null,
    result: ComparisonResult.CaptureError,
  })),
}));

export const interactionFailureTests = [
  makeTest({
    status: TestStatus.Broken,
    captureError: {
      kind: CaptureErrorKind.InteractionFailure,
      error: {
        name: "Error",
        message: `Unable to find an element by: [data-testid="button-toggle-snapshot"]`,
        stack: `Error: Unable to find an element by: [data-testid="button-toggles-snapshot"]

Ignored nodes: comments, script, style
<div
  class="css-nlyae3"
  data-canvas="right"
  orientation="right"
>
  <div
    class="css-1g4yje1"
  >
    <div
      class="css-3fce27"
    >
      <div
        class="css-1o56ikb"
      >
        <div
          class="css-gghy96"
        >
          <div
            class="css-k4d9wy"
          >
            <b>
              1 change
            </b>
            <svg
              class="css-1g8ys9d css-6m3b1s-Svg e82dnwa0"
              height="14px"
              viewBox="0 0 14 14"
              width="14px"
            >`,
      },
    },
  }),
];

export const announcedBuild = {
  __typename: "AnnouncedBuild",
  id: "1",
  number: 1,
  branch: "feature-branch",
  commit: "ecacce21db9a0f",
  committedAt: Date.now() - 2000,
  uncommittedHash: "",
  status: BuildStatus.Announced,
  browsers: [makeBrowserInfo(Browser.Chrome), makeBrowserInfo(Browser.Safari)],
  isLimited: false,
  isSuperseded: false,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
} satisfies AnnouncedBuild;

export const publishedBuild = {
  ...announcedBuild,
  __typename: "PublishedBuild",
  status: BuildStatus.Published,
  isolatorUrl: "https://appid-hash.chromatic.com/iframe.html",
  storybookUrl: "https://appid-hash.chromatic.com/",
  publishedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
} satisfies PublishedBuild;

export const startedBuild = {
  ...publishedBuild,
  __typename: "StartedBuild",
  status: BuildStatus.InProgress,
  componentCount: 1,
  specCount: 3,
  testCount: 3,
  docsCount: 0,
  webUrl: "https://www.chromatic.com/build?appId=123&id=1",
  startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  preparedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
} satisfies StartedBuild;

export const passedBuild = {
  ...startedBuild,
  __typename: "CompletedBuild",
  status: BuildStatus.Passed,
  result: BuildResult.Success,
  completedAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
} satisfies CompletedBuild;

export const pendingBuild = {
  ...passedBuild,
  status: BuildStatus.Pending,
} satisfies CompletedBuild;

export const acceptedBuild = {
  ...passedBuild,
  status: BuildStatus.Accepted,
} satisfies CompletedBuild;

export const brokenBuild = {
  ...passedBuild,
  status: BuildStatus.Broken,
} satisfies CompletedBuild;

export const failedBuild = {
  ...passedBuild,
  status: BuildStatus.Failed,
} satisfies CompletedBuild;
