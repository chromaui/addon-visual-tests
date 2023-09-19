import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React from "react";

import { Browser, ComparisonResult, TestStatus } from "../../gql/graphql";
import { screenModes } from "../../modes";
import { playAll } from "../../utils/playAll";
import { makeTest, makeTests } from "../../utils/storyData";
import { summarizeTests } from "../../utils/summarizeTests";
import { Grid } from "./SnapshotComparison";
import { SnapshotControls } from "./SnapshotControls";

const withTests = (tests: ReturnType<typeof makeTests>) => ({
  ...summarizeTests(tests),
  selectedTest: tests[0],
  selectedComparison: tests[0].comparisons[0],
});

const meta = {
  component: SnapshotControls,
  args: {
    ...withTests(
      makeTests({
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
      })
    ),
    onSelectMode: action("onSelectMode"),
    onSelectBrowser: action("onSelectBrowser"),
    userCanReview: true,
    isReviewable: true,
    isReviewing: false,
    onAccept: action("onAccept"),
    onUnaccept: action("onUnaccept"),
    diffVisible: true,
    setDiffVisible: action("setDiffVisible"),
  },
  decorators: [
    (Story) => (
      <Grid>
        <Story />
      </Grid>
    ),
  ],
  parameters: {
    chromatic: {
      modes: screenModes,
    },
  },
} satisfies Meta<typeof SnapshotControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSingleTest = {
  args: withTests([makeTest({ status: TestStatus.Pending })]),
} satisfies Story;

export const WithSingleTestInProgress = {
  args: {
    ...WithSingleTest.args,
    isInProgress: true,
  },
} satisfies Story;

export const WithMultipleTests = {} satisfies Story;

export const WithMultipleTestsInProgress = {
  args: {
    isInProgress: true,
  },
} satisfies Story;

export const WithSingleTestAccepting = {
  args: {
    ...WithSingleTest.args,
    isReviewing: true,
  },
} satisfies Story;

export const WithSingleTestAccepted = {
  args: withTests([makeTest({ status: TestStatus.Accepted })]),
} satisfies Story;

export const WithSingleTestUnreviewable = {
  args: {
    ...WithSingleTest.args,
    isReviewable: false,
  },
} satisfies Story;

export const SelectViewport = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "480px" });
    await userEvent.click(menu);
  }),
} satisfies Story;

export const SelectedViewport = {
  play: playAll(SelectViewport, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("1200px");
    await userEvent.click(items[canvasIndex]);
    expect(args.onSelectMode).toHaveBeenCalledWith(expect.objectContaining({ name: "1200px" }));
  }),
} satisfies Story;

export const SelectBrowser = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
  }),
} satisfies Story;

export const SelectedBrowser = {
  play: playAll(SelectBrowser, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
    expect(args.onSelectBrowser).toHaveBeenCalledWith(expect.objectContaining({ name: "Safari" }));
  }),
} satisfies Story;

export const BatchAcceptOptions = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Batch accept" });
    await userEvent.click(menu);
  }),
} satisfies Story;

export const BatchAcceptedBuild = {
  play: playAll(BatchAcceptOptions, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("Accept entire build");
    await userEvent.click(items[canvasIndex]);
    await expect(args.onAccept).toHaveBeenCalledWith(args.selectedTest.id, "BUILD");
  }),
} satisfies Story;
