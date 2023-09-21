import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React, { ComponentProps } from "react";

import {
  Browser,
  ComparisonResult,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { panelModes } from "../../modes";
import { playAll } from "../../utils/playAll";
import { makeComparison, makeTest, makeTests } from "../../utils/storyData";
import { interactionFailureTests, pendingBuild } from "./mocks";
import { SnapshotComparison } from "./SnapshotComparison";

const meta = {
  component: SnapshotComparison,
  args: {
    storyId: "button--primary",
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
    selectedBuild: pendingBuild,
    setSettingsVisible: action("setSettingsVisible"),
    settingsVisible: false,
    setWarningsVisible: action("setWarningsVisible"),
    warningsVisible: false,
    setAccessToken: action("setAccessToken"),
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
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

export const MultipleTestsFirstAdded: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        {
          status: TestStatus.Pending,
          viewport: 800,
          comparisonResults: [ComparisonResult.Added, ComparisonResult.Equal],
        },
        {
          status: TestStatus.Pending,
          viewport: 1200,
        },
      ],
    }),
  },
};

export const MultipleTestsAllAdded: Story = {
  args: {
    tests: makeTests({
      browsers: [Browser.Chrome, Browser.Safari],
      viewports: [
        {
          status: TestStatus.Pending,
          result: TestResult.Added,
          viewport: 800,
          comparisonResults: [ComparisonResult.Added, ComparisonResult.Added],
        },
      ],
    }),
  },
};

export const SingleTestAdded: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending, result: TestResult.Added })],
  },
};

export const ShowingBaseline: Story = {
  args: {
    baselineImageVisible: true,
  },
} satisfies Story;

export const NoBaseline: Story = {
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

export const SwitchingMode = {
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
            imageUrl: `/ProjectItem-${comparison.browser.name}-${parseInt(test.mode.name, 10)}.png`,
            imageWidth: parseInt(test.mode.name, 10),
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
  args: SwitchingMode.args,
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const SwitchingTests = {
  args: SwitchingMode.args,
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
