import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, fireEvent, screen, userEvent, within } from "@storybook/testing-library";
import type { StoryContext } from "@storybook/types";
import React, { ComponentProps } from "react";

import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { panelModes } from "../../modes";
import { playAll } from "../../utils/playAll";
import { makeComparison, makeTest, makeTests } from "../../utils/storyData";
import { storyWrapper } from "../../utils/storyWrapper";
import { ControlsProvider } from "./ControlsContext";
import { interactionFailureTests, pendingBuild, pendingTests, withTests } from "./mocks";
import { SelectedBuildProvider } from "./SelectedBuildContext";
import { SnapshotComparison } from "./SnapshotComparison";

const build = { ...pendingBuild, startedAt: new Date() };

const meta = {
  component: SnapshotComparison,
  decorators: [
    storyWrapper(SelectedBuildProvider, (ctx) => ({ watchState: ctx.parameters.selectedBuild })),
    storyWrapper(ControlsProvider),
  ],
  args: {
    storyId: "button--primary",
    userCanReview: true,
    isStarting: false,
    isBuildFailed: false,
    isReviewable: true,
    isReviewing: false,
    onAccept: action("onAccept"),
    onUnaccept: action("onUnaccept"),
    shouldSwitchToLastBuildOnBranch: false,
    setAccessToken: action("setAccessToken"),
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    selectedBuild: withTests(build, pendingTests),
  },
} satisfies Meta<typeof SnapshotComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress = {
  parameters: {
    selectedBuild: withTests(
      build,
      makeTests({
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
      })
    ),
  },
} satisfies Story;

export const Default = {} satisfies Story;

/**
 * Sort of confusing situation where the only comparison with changes (1200px/Safari) is on the
 * "opposite" side of the current comparison (800px/Chrome). In this case we still show the first
 * test, which does not have a visual diff.
 */
export const FirstPassed: Story = {
  parameters: {
    selectedBuild: withTests(
      build,
      makeTests({
        browsers: [Browser.Chrome, Browser.Safari],
        viewports: [
          { status: TestStatus.Passed, viewport: 800 },
          {
            status: TestStatus.Pending,
            viewport: 1200,
            comparisonResults: [ComparisonResult.Equal, ComparisonResult.Changed],
          },
        ],
      })
    ),
  },
} satisfies Story;

export const StoryAdded: Story = {
  parameters: {
    selectedBuild: withTests(
      build,
      makeTests({
        browsers: [Browser.Chrome, Browser.Safari],
        viewports: [
          {
            status: TestStatus.Pending,
            result: TestResult.Added,
            viewport: 800,
            comparisons: [
              makeComparison({ result: ComparisonResult.Added, baseCapture: null }),
              makeComparison({ result: ComparisonResult.Added, baseCapture: null }),
            ],
          },
        ],
      })
    ),
  },
};

export const ShowingBaseline: Story = {
  play: playAll(async ({ canvasElement }) => {
    fireEvent.click(await findByRole(canvasElement, "button", { name: "Switch snapshot" }));
  }),
} satisfies Story;

export const NoBaseline: Story = {
  parameters: {
    selectedBuild: withTests(build, [
      makeTest({
        status: TestStatus.Pending,
        comparisons: [
          {
            ...makeComparison({}),
            baseCapture: null,
          },
        ],
      }),
    ]),
  },
};

export const SwitchingMode = {
  parameters: {
    selectedBuild: withTests(
      build,
      makeTests({
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
              imageUrl: `/ProjectItem-${comparison.browser.name}-${parseInt(
                test.mode.name,
                10
              )}.png`,
              imageWidth: parseInt(test.mode.name, 10),
            },
          },
        })),
      }))
    ),
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
  parameters: SwitchingMode.parameters,
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const SwitchingTests = {
  parameters: SwitchingMode.parameters,
  render: function RenderSwitchingTests(
    { ...props }: ComponentProps<typeof SnapshotComparison>,
    { parameters }: StoryContext<any>
  ) {
    const [build, setBuild] = React.useState<any>();
    if (!build) setTimeout(() => setBuild(withTests(build, [makeTest({})])), 0);
    return (
      <SelectedBuildProvider watchState={build || parameters.selectedBuild}>
        <SnapshotComparison {...props} />
      </SelectedBuildProvider>
    );
  },
} satisfies Story;

export const InteractionFailure = {
  parameters: {
    selectedBuild: withTests(build, interactionFailureTests),
  },
};
