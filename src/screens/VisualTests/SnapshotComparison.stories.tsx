import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React, { ComponentProps } from "react";

import { Browser, ComparisonResult, StoryTestFieldsFragment, TestStatus } from "../../gql/graphql";
import { playAll } from "../../utils/playAll";
import { makeComparison, makeTest, makeTests } from "../../utils/storyData";
import { interactionFailureTests } from "./mocks";
import { SnapshotComparison } from "./SnapshotComparison";

const meta = {
  component: SnapshotComparison,
  args: {
    tests: makeTests({
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
    }),
    startedAt: new Date(),
    userCanReview: true,
    isStarting: false,
    isBuildFailed: false,
    isReviewable: true,
    isReviewing: false,
    onAccept: action("onAccept"),
    onUnaccept: action("onUnaccept"),
    baselineImageVisible: false,
    shouldSwitchToLastBuildOnBranch: false,
    // TODO: Should probably pass in a real build here, based on whatever is in visual tests stories
    selectedBuild: {
      id: "build-id",
      number: 123,
      branch: "feature-branch",
    } as any,
    setSettingsVisible: action("setSettingsVisible"),
    settingsVisible: false,
    setWarningsVisible: action("setWarningsVisible"),
    warningsVisible: false,
    setAccessToken: action("setAccessToken"),
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress = {
  args: {
    tests: makeTests({
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
    }),
  },
} satisfies Story;

export const Default = {} satisfies Story;

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Safari) is on the
 * "opposite" side of the current comparison (800px/Chrome). In this case we still show the first
 * test, which does not have a visual diff.
 */
export const FirstPassed: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        { status: TestStatus.Passed, viewport: 800 },
        {
          status: TestStatus.Pending,
          viewport: 1200,
          comparisonResults: [ComparisonResult.Equal, ComparisonResult.Changed],
        },
      ],
    }),
  },
} satisfies Story;

export const WithSingleTestNoBaseline: Story = {
  args: {
    tests: [
      makeTest({
        status: TestStatus.Pending,
        comparisons: [
          {
            ...makeComparison({}),
            baseCapture: null,
          },
        ],
      }),
    ],
  },
};

export const ShowingBaseline: Story = {
  args: {
    baselineImageVisible: true,
  },
} satisfies Story;

export const SwitchingViewport = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        { status: TestStatus.Passed, viewport: 320 },
        { status: TestStatus.Passed, viewport: 600 },
        { status: TestStatus.Passed, viewport: 1200 },
      ],
    }).map((test) => ({
      ...test,
      comparisons: test.comparisons.map((comparison) => ({
        ...comparison,
        headCapture: {
          ...comparison.headCapture,
          captureImage: {
            imageUrl: `/ProjectItem-${comparison.browser.name}-${comparison.viewport.width}.png`,
            imageWidth: comparison.viewport.width,
          },
        },
      })),
    })),
  },
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "320px" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("1200px");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const SwitchingBrowser = {
  args: SwitchingViewport.args,
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const SwitchingTests = {
  args: SwitchingViewport.args,
  render: function RenderSwitchingTests({ ...props }: ComponentProps<typeof SnapshotComparison>) {
    const [tests, setTests] = React.useState<StoryTestFieldsFragment[]>();
    if (!tests) setTimeout(() => setTests([makeTest({})]), 0);
    return <SnapshotComparison {...props} tests={tests || props.tests} />;
  },
} satisfies Story;

export const InteractionFailure = {
  args: {
    tests: interactionFailureTests,
  },
};
