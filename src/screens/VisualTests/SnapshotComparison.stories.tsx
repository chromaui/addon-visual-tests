// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import React, { ComponentProps } from 'react';
import type { StoryContext } from 'storybook/internal/types';
import { fn } from 'storybook/test';
import { findByRole, fireEvent, screen, userEvent, within } from 'storybook/test';

import { Browser, ComparisonResult, TestResult, TestStatus } from '../../gql/graphql';
import { panelModes } from '../../modes';
import { playAll, playSequentially } from '../../utils/playAll';
import { makeComparison, makeTest, makeTests } from '../../utils/storyData';
import { storyWrapper } from '../../utils/storyWrapper';
import { BuildProvider } from './BuildContext';
import { ControlsProvider } from './ControlsContext';
import { buildInfo, interactionFailureTests, pendingBuild, pendingTests, withTests } from './mocks';
import { ReviewTestProvider } from './ReviewTestContext';
import { SnapshotComparison } from './SnapshotComparison';

const build = { ...pendingBuild, startedAt: new Date() };

const meta = {
  component: SnapshotComparison,
  decorators: [
    storyWrapper(ReviewTestProvider, (ctx) => ({
      watchState: {
        isReviewing: false,
        userCanReview: true,
        buildIsReviewable: true,
        acceptTest: fn().mockName('acceptTest'),
        unacceptTest: fn().mockName('unacceptTest'),
        ...ctx.parameters.reviewTest,
      },
    })),
    storyWrapper(BuildProvider, (ctx) => ({ watchState: buildInfo(ctx.parameters.selectedBuild) })),
    storyWrapper(ControlsProvider),
  ],
  args: {
    storyId: 'button--primary',
    isOutdated: false,
    isStarting: false,
    isBuildFailed: false,
    shouldSwitchToLastBuildOnBranch: false,
    setAccessToken: fn().mockName('setAccessToken'),
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

export const Loading = {
  parameters: {
    msw: {
      handlers: [http.get('/B.png', () => delay('infinite'))],
    },
  },
} satisfies Story;

export const Default = {} satisfies Story;

export const Spotlight = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('switch', { name: 'Show spotlight' });
    await userEvent.click(button);
  }),
} satisfies Story;

export const SpotlightOnly = {
  play: playAll(Spotlight, async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('switch', { name: 'Hide diff' });
    await userEvent.click(button);
  }),
} satisfies Story;

/**
 * When first loading a story, we prefer to show changed comparisons over unchanged comparisons.
 */
export const PrefersChanged: Story = {
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
    fireEvent.click(await findByRole(canvasElement, 'button', { name: 'Show baseline snapshot' }));
  }),
} satisfies Story;

export const BaselineLoading: Story = {
  ...ShowingBaseline,
  parameters: {
    msw: {
      handlers: [http.get('/A.png', () => delay('infinite'))],
    },
  },
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
} satisfies Story;

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
        comparisons: test.comparisons.map((comparison) => {
          const imageUrl = `/ProjectItem-${comparison.browser.name}-${parseInt(
            test.mode.name,
            10
          )}.png`;
          return {
            ...comparison,
            headCapture: {
              ...comparison.headCapture,
              captureImage: {
                imageUrl,
                imageWidth: parseInt(test.mode.name, 10),
                imageHeight: 753,
                thumbnailUrl: imageUrl,
              },
            },
          };
        }),
      }))
    ),
  },
  play: playSequentially(async ({ canvas }) => {
    const menu = await canvas.findByRole('button', { name: 'Switch mode' });
    await userEvent.click(menu);
    const mode = await screen.findByText('1200px');
    await userEvent.click(mode);
  }),
} satisfies Story;

export const SwitchingBrowser = {
  parameters: SwitchingMode.parameters,
  play: playSequentially(async ({ canvas }) => {
    const menu = await canvas.findByRole('button', { name: 'Switch browser' });
    await userEvent.click(menu);
    const browser = await screen.findByText('Safari');
    await userEvent.click(browser);
  }),
} satisfies Story;

export const SwitchingTests = {
  parameters: SwitchingMode.parameters,
  render: function RenderSwitchingTests(
    { ...props }: ComponentProps<typeof SnapshotComparison>,
    { parameters }: StoryContext<any>
  ) {
    const [activeBuild, setBuild] = React.useState<any>();
    if (!activeBuild) setTimeout(() => setBuild(withTests(build, [makeTest({})])), 0);
    return (
      <BuildProvider watchState={buildInfo(activeBuild || parameters.selectedBuild)}>
        <SnapshotComparison {...props} />
      </BuildProvider>
    );
  },
} satisfies Story;

export const InteractionFailure = {
  parameters: {
    selectedBuild: withTests(build, interactionFailureTests),
  },
};

export const NewBaseline = {
  parameters: {
    selectedBuild: withTests(
      build,
      makeTests({
        browsers: [Browser.Chrome, Browser.Safari],
        viewports: [
          { status: TestStatus.Passed, viewport: 800 },
          {
            status: TestStatus.Pending,
            result: TestResult.Changed,
            viewport: 1200,
            comparisons: [
              makeComparison({ result: ComparisonResult.Added, baseCapture: null }),
              makeComparison({ result: ComparisonResult.Equal }),
            ],
          },
        ],
      })
    ),
  },
} satisfies Story;
