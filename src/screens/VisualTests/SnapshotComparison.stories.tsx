import { action } from "@storybook/addon-actions";
import { useState } from "@storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React, { ComponentProps } from "react";

import { Browser, ComparisonResult, TestStatus } from "../../gql/graphql";
import { playAll } from "../../utils/playAll";
import {
  baseCapture,
  captureDiff,
  headCapture,
  makeBrowserInfo,
  makeTest,
  makeTests,
  makeViewportInfo,
} from "../../utils/storyData";
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
    isAccepting: false,
    onAccept: action("onAccept"),
    baselineImageVisible: false,
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
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
};

export const WithMultipleTests: Story = {};

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Saf) is on the
 * "opposite" side of the current comparison (800px/Chrome)
 */
export const WithMultipleTestsFirstPassed: Story = {
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
};

export const WithSingleTest: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const WithSingleTestAccepting: Story = {
  args: {
    isAccepting: true,
    tests: [makeTest({ status: TestStatus.Pending })],
  },
};

export const WithSingleTestAccepted: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Accepted })],
  },
};

export const WithSingleTestShowingBaseline: Story = {
  args: {
    tests: [makeTest({ status: TestStatus.Pending })],
    baselineImageVisible: true,
  },
};

export const SwitchingViewport: Story = {
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
};

export const SwitchingBrowser: Story = {
  args: SwitchingViewport.args,
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
  }),
};

export const SwitchingTests: Story = {
  args: SwitchingViewport.args,
  render: function RenderSwitchingTests({ ...props }: ComponentProps<typeof SnapshotComparison>) {
    const [tests, setTests] = React.useState(null);
    if (!tests) setTimeout(() => setTests([makeTest({})]), 0);
    return <SnapshotComparison {...props} tests={tests || props.tests} />;
  },
};

export const InteractionFailure: Story = {
  args: {
    tests: [
      makeTest({
        status: TestStatus.Broken,
        comparisons: [
          {
            id: "1",
            browser: makeBrowserInfo(Browser.Chrome),
            viewport: makeViewportInfo(1200),
            result: ComparisonResult.CaptureError,
            baseCapture,
            headCapture: {
              ...headCapture,
              captureError: {
                kind: "INTERACTION_FAILURE",
                error: {
                  name: "Error",
                  message: `Unable to find an element by: [data-testid="button-toggle-snapshot"]`,
                },
              },
            },
            captureDiff,
          },
        ],
      }),
    ],
  },
};
