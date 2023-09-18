import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";
import React, { ComponentProps } from "react";

import { Browser, ComparisonResult, TestStatus } from "../../gql/graphql";
import { playAll } from "../../utils/playAll";
import { makeTest, makeTests } from "../../utils/storyData";
import { summarizeTests } from "../../utils/summarizeTests";
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
} satisfies Meta<typeof SnapshotControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSingleTest: Story = {
  args: withTests([makeTest({ status: TestStatus.Pending })]),
};

export const WithSingleTestInProgress: Story = {
  args: {
    ...WithSingleTest.args,
    isInProgress: true,
  },
};

export const WithMultipleTests: Story = {};

export const WithMultipleTestsInProgress: Story = {
  args: {
    ...WithMultipleTests.args,
    isInProgress: true,
  },
};

export const WithSingleTestAccepting: Story = {
  args: {
    ...WithSingleTest.args,
    isReviewing: true,
  },
};

export const WithSingleTestAccepted: Story = {
  args: withTests([makeTest({ status: TestStatus.Accepted })]),
};

export const WithSingleTestUnreviewable: Story = {
  args: {
    ...WithSingleTest.args,
    isReviewable: false,
  },
};

export const SelectViewport: Story = {
  play: playAll<Story>(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "480px" });
    await userEvent.click(menu);
  }),
};

export const SelectedViewport: Story = {
  play: playAll<Story>(SelectViewport, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("1200px");
    await userEvent.click(items[canvasIndex]);
    expect(args.onSelectMode).toHaveBeenCalledWith(expect.objectContaining({ name: "1200px" }));
  }),
};

export const SelectBrowser: Story = {
  play: playAll<Story>(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
  }),
};

export const SelectedBrowser: Story = {
  play: playAll<Story>(SelectBrowser, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
    expect(args.onSelectBrowser).toHaveBeenCalledWith(expect.objectContaining({ name: "Safari" }));
  }),
};

export const BatchAcceptOptions: Story = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Batch accept" });
    await userEvent.click(menu);
  }),
};

export const BatchAcceptedBuild: Story = {
  play: playAll(BatchAcceptOptions, async ({ args, canvasIndex }) => {
    const items = await screen.findAllByText("Accept entire build");
    await userEvent.click(items[canvasIndex]);
    await expect(args.onAccept).toHaveBeenCalledWith(args.selectedTest.id, "BUILD");
  }),
};
