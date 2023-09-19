import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React, { ComponentProps } from "react";

import {
  Browser,
  CaptureErrorKind,
  ComparisonResult,
  StoryTestFieldsFragment,
  TestStatus,
} from "../../gql/graphql";
import { screenModes } from "../../modes";
import { playAll } from "../../utils/playAll";
import { makeTest, makeTests } from "../../utils/storyData";
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
    userCanReview: true,
    isReviewable: true,
    isReviewing: false,
    onAccept: action("onAccept"),
    onUnaccept: action("onUnaccept"),
    baselineImageVisible: false,
  },
  parameters: {
    chromatic: {
      modes: screenModes,
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
        { status: TestStatus.InProgress, viewport: 480 },
        { status: TestStatus.InProgress, viewport: 800 },
        { status: TestStatus.InProgress, viewport: 1200 },
      ],
    }),
  },
} satisfies Story;

export const WithMultipleTests = {} satisfies Story;

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Saf) is on the
 * "opposite" side of the current comparison (800px/Chrome)
 */
export const WithMultipleTestsFirstPassed = {
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

export const WithSingleTest = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
} satisfies Story;

export const WithSingleTestAccepting = {
  args: {
    ...WithSingleTest.args,
    isReviewing: true,
  },
} satisfies Story;

export const WithSingleTestAccepted = {
  args: {
    tests: [makeTest({ status: TestStatus.Accepted })],
  },
} satisfies Story;

export const WithSingleTestOutdated = {
  args: {
    ...WithSingleTest.args,
    isReviewable: false,
  },
} satisfies Story;

export const WithSingleTestShowingBaseline = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
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
    tests: [
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
    ],
  },
} satisfies Story;

export const BatchAcceptOptions = {
  args: WithSingleTest.args,
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Batch accept" });
    await userEvent.click(menu);
  }),
} satisfies Story;

export const BatchAcceptedBuild = {
  args: WithSingleTest.args,
  play: playAll(BatchAcceptOptions, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("Accept entire build");
    await userEvent.click(items[canvasIndex]);
    await expect(args.onAccept).toHaveBeenCalledWith(args.tests[0].id, "BUILD");
  }),
} satisfies Story;
