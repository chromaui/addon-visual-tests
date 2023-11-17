/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line import/no-unresolved
import { VariablesOf } from "@graphql-typed-document-node/core";
import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import {
  findByLabelText,
  findByRole,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@storybook/testing-library";
import { delay, HttpResponse } from "msw";
import React from "react";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import type {
  LastBuildOnBranchBuildFieldsFragment,
  MakeOptional,
  SelectedBuildFieldsFragment,
} from "../../gql/graphql";
import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { panelModes } from "../../modes";
import {
  withGraphQLMutationParameters,
  withGraphQLQueryParameters,
} from "../../utils/gqlStoryHelpers";
import { GraphQLClientProvider } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeComparison, makeTest, makeTests } from "../../utils/storyData";
import { storyWrapper } from "../../utils/storyWrapper";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { ControlsProvider } from "./ControlsContext";
import { QueryBuild } from "./graphql";
import {
  acceptedBuild,
  acceptedTests,
  brokenBuild,
  brokenTests,
  failedBuild,
  inProgressTests,
  interactionFailureTests,
  passedBuild,
  passedTests,
  pendingBuild,
  pendingTests,
  pendingTestsNewBrowser,
  pendingTestsNewMode,
  pendingTestsNewStory,
  startedBuild,
  withTests,
} from "./mocks";
import { VisualTests, VisualTestsWithoutSelectedBuildId } from "./VisualTests";

const browsers = [Browser.Chrome, Browser.Safari];

// A build that satisfies both the result of each part of the query. We just use
// builds that satsify both to make our lives easier
type LastOrSelectedBuildFragment = SelectedBuildFieldsFragment &
  LastBuildOnBranchBuildFieldsFragment;

type QueryInput = {
  /** If `lastBuildOnBranch` is unset, there will be no last build on the branch */
  lastBuildOnBranch?: LastOrSelectedBuildFragment;

  /** If `selectedBuild` is unset, `lastBuildOnBranch` will be used *if* it matches `selectedBuildId` */
  selectedBuild?: LastOrSelectedBuildFragment;

  userCanReview?: boolean;
};
function mapQuery(
  { lastBuildOnBranch, selectedBuild: selectedBuildInput, userCanReview = true }: QueryInput,
  { selectedBuildId }: VariablesOf<typeof QueryBuild>
) {
  if (selectedBuildInput && selectedBuildInput?.id !== selectedBuildId) {
    throw new Error("Invalid story, selectedBuild does not match selectedBuildId");
  }

  const selectedBuild =
    selectedBuildInput ??
    (lastBuildOnBranch?.id === selectedBuildId ? lastBuildOnBranch : undefined);

  return {
    project: {
      name: "acme",
      lastBuildOnBranch,
    },
    selectedBuild,
    viewer: {
      projectMembership: {
        userCanReview,
      },
    },
  };
}

// We don't have jest.mock() so we have to make something similar for typing
function mock<T extends (...args: any[]) => any>(f: T) {
  return f as unknown as T & {
    mock: { calls: Parameters<T>[] };
  };
}

type StoryArgs = Parameters<typeof VisualTestsWithoutSelectedBuildId>[0] & {
  addNotification: () => void;
  $graphql?: { AddonVisualTestsBuild?: QueryInput };
};
const meta = {
  title: "screens/VisualTests/VisualTests",
  component: VisualTestsWithoutSelectedBuildId,
  decorators: [storyWrapper(ControlsProvider), storyWrapper(GraphQLClientProvider)],
  parameters: { chromatic: { modes: panelModes } },
  argTypes: {
    addNotification: { type: "function", target: "manager-api" },
    $graphql: {
      AddonVisualTestsBuild: { map: mapQuery },
    },
  },
  args: {
    isOutdated: false,
    setSelectedBuildInfo: action("setSelectedBuildInfo"),
    dismissBuildError: action("dismissBuildError"),
    gitInfo: {
      userEmailHash: "xyz987",
      branch: "feature-branch",
      slug: "chromaui/addon-visual-tests",
      commit: "abc123",
      committedAt: Date.now() - 1000,
      uncommittedHash: "",
    },
    storyId: "button--primary",
    projectId: "Project:id123",
    startDevBuild: action("startDevBuild"),
    setAccessToken: action("setAccessToken"),
    setOutdated: action("setOutdated"),
    updateBuildStatus: action("updateBuildStatus") as any,
    addNotification: action("addNotification"),
    $graphql: { AddonVisualTestsBuild: {} },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<MakeOptional<StoryArgs, keyof typeof meta.args>>;

export const Loading = {
  args: { $graphql: {} },
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", () => delay("infinite")),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const NotFound = {
  args: { $graphql: {} },
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", () =>
      HttpResponse.json({ data: { project: null } } as any)
    ),
  },
} satisfies Story;

export const NoAccess = {
  args: { $graphql: {} },
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", () =>
      HttpResponse.json({
        errors: [
          {
            extensions: { code: "FORBIDDEN" },
            locations: [{ line: 13, column: 3 }],
            message: "No Access",
            path: ["selectedBuild"],
          },
        ],
      } as any)
    ),
  },
} satisfies Story;

export const ServerError = {
  args: { $graphql: {} },
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", () =>
      HttpResponse.json({ errors: [{ message: "Something went wrong on the server" }] })
    ),
  },
} satisfies Story;

export const EmptyBranch = {
  // @ts-expect-error Type conflict due to us explicitly defining `StoryArgs` above,
  // as it cannot be auto-inferred from meta
  render: (args: typeof meta.args) => {
    // custom render for mapping `updateBuildStatus` to a function which is mocked, but returns data instead of a function
    return (
      <VisualTests
        {...args}
        updateBuildStatus={(fn) => args.updateBuildStatus(typeof fn === "function" ? fn({}) : fn)}
      />
    );
  },
  play: async ({ args }) => {
    await waitFor(() => {
      expect(args.updateBuildStatus).toHaveBeenCalledWith({});
    });
  },
} satisfies Story;

export const EmptyBranchStartedLocalBuild = {
  ...EmptyBranch,
  args: {
    localBuildProgress: {
      buildProgressPercentage: 1,
      currentStep: "initialize",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        initialize: { startedAt: Date.now() - 1000 },
      },
    },
  },
  // @ts-expect-error as above
} satisfies Story;

export const EmptyBranchLocalBuildUploading = {
  ...EmptyBranch,
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 25,
      currentStep: "upload",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        upload: {
          startedAt: Date.now() - 3000,
          numerator: 10,
          denominator: 100,
        },
      },
    },
  },
  // @ts-expect-error as above
} satisfies Story;

export const NoStoryBuildRunningBuildFailed = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "error",
      originalError: new Error("Something failed"),
      formattedError: "🚨 Something failed!!",
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=3305-114569&mode=design&t=OKHjqJzqTsOx3IXJ-0"
    ),
  },
} satisfies Story;

/** This story should maintain the "no build" UI with a progress bar */
export const EmptyBranchLocalBuildCapturing = {
  args: {
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(startedBuild, inProgressTests),
      },
    },
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 75,
      currentStep: "snapshot",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        snapshot: {
          startedAt: Date.now() - 5000,
          numerator: 64,
          denominator: 340,
        },
      },
    },
  },
} satisfies Story;

/**
 * As soon as we get a capture for the current story, we should switch to it, which both means
 * rendering it in the UI, as well as switching the selected build to it.
 */
export const EmptyBranchLocalBuildCapturedCurrentStory = {
  args: {
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTests),
      },
    },
    localBuildProgress: {
      ...EmptyBranchLocalBuildCapturing.args.localBuildProgress,
      buildProgressPercentage: 90,
      stepProgress: {
        ...EmptyBranchLocalBuildCapturing.args.localBuildProgress.stepProgress,
        snapshot: {
          ...EmptyBranchLocalBuildCapturing.args.localBuildProgress.stepProgress.snapshot,
          numerator: 310,
        },
      },
    },
  },
  play: async ({ args, argsByTarget }) => {
    const graphqlArgs = argsByTarget.graphql?.$graphql as typeof args.$graphql; // We need to type argsByTarget
    await waitFor(() => {
      const lastUpdater = mock(args.setSelectedBuildInfo!).mock.calls.at(-1)?.[0];

      const result =
        typeof lastUpdater === "function" ? lastUpdater(args.selectedBuildInfo) : lastUpdater;

      expect(result).toEqual({
        buildId: graphqlArgs?.AddonVisualTestsBuild?.lastBuildOnBranch?.id,
        storyId: meta.args.storyId,
      });
    });
  },
} satisfies Story;

/** Complete builds should always be switched to */
export const EmptyBranchCIBuildPending = {
  args: {
    $graphql: EmptyBranchLocalBuildCapturedCurrentStory.args.$graphql,
  },
  play: EmptyBranchLocalBuildCapturedCurrentStory.play,
} satisfies Story;

// There is a selected build, but this story is new (not on the build at all)
export const StoryAddedNotInBuild = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests({ ...pendingBuild }, []),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1898-562751&mode=design&t=ciag0nGKx2OGmoSR-4"
    ),
  },
} satisfies Story;

export const StoryAddedNotInBuildStarting = {
  args: {
    ...StoryAddedNotInBuild.args,
    localBuildProgress: {
      buildProgressPercentage: 1,
      currentStep: "initialize",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        initialize: { startedAt: Date.now() - 1000 },
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1898-562751&mode=design&t=ciag0nGKx2OGmoSR-4"
    ),
  },
} satisfies Story;

export const StoryAddedNotInBuildCompletedLocalProgressIsOnSelectedBuild = {
  args: {
    selectedBuildInfo: { buildId: "Build:shared-id", storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTestsNewStory),
        selectedBuild: withTests({ ...pendingBuild, id: "Build:shared-id" }, []),
      },
    },
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildId: "shared-id",
      buildProgressPercentage: 100,
      currentStep: "complete",
    },
  },
} satisfies Story;

export const StoryAddedInSelectedBuild = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTestsNewStory),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1898-562751&mode=design&t=ciag0nGKx2OGmoSR-4"
    ),
  },
} satisfies Story;

/**
 * Although this state doesn't immediately render the captured story (it probably should),
 * it should switch to the lastBuildOnBranch immediately.
 */
export const StoryAddedInLastBuildOnBranchNotInSelected = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests({ ...pendingBuild, id: "2" }, pendingTestsNewStory),
        selectedBuild: withTests(pendingBuild, []),
      },
    },
  },
  play: EmptyBranchLocalBuildCapturedCurrentStory.play,
} satisfies Story;

export const StoryAddedAndAccepted = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, [
          makeTest({
            result: TestResult.Added,
            status: TestStatus.Accepted,
            comparisonResults: [ComparisonResult.Added],
          }),
        ]),
      },
    },
  },
} satisfies Story;

export const ModeAddedInSelectedBuild = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTestsNewMode),
      },
    },
  },
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "480px" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("1200px");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const ModeAddedAndAccepted = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, [
          makeTest({
            result: TestResult.Added,
            status: TestStatus.Accepted,
            comparisonResults: [ComparisonResult.Added],
          }),
          makeTest({
            result: TestResult.Equal,
          }),
        ]),
      },
    },
  },
} satisfies Story;

export const BrowserAddedInSelectedBuild = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTestsNewBrowser),
      },
    },
  },
  play: playAll(async ({ canvasElement, canvasIndex }) => {
    const canvas = within(canvasElement);
    const menu = await canvas.findByRole("button", { name: "Chrome" });
    await userEvent.click(menu);
    const items = await screen.findAllByText("Safari");
    await userEvent.click(items[canvasIndex]);
  }),
} satisfies Story;

export const BrowserAddedAndAccepted: Story = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(
          pendingBuild,
          makeTests({
            browsers: [Browser.Chrome, Browser.Safari],
            viewports: [
              {
                viewport: 480,
                result: TestResult.Changed,
                status: TestStatus.Accepted,
                comparisons: [
                  makeComparison({ result: ComparisonResult.Added, browser: Browser.Chrome }),
                  makeComparison({ result: ComparisonResult.Equal, browser: Browser.Safari }),
                ],
              },
            ],
          })
        ),
      },
    },
  },
};

export const NoChanges = {
  args: {
    selectedBuildInfo: { buildId: passedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(passedBuild, passedTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

/** We just switched branches so the selected build is out of date */
export const NoChangesOnWrongBranch = {
  args: {
    selectedBuildInfo: { buildId: passedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        selectedBuild: withTests(passedBuild, passedTests),
      },
    },
    gitInfo: { ...meta.args.gitInfo, branch: "new-branch" },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

/**
 * We've started a new build but it's not done yet
 */
export const PendingLocalBuildStarting = {
  args: {
    ...EmptyBranchStartedLocalBuild.args,
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTests),
      },
    },
  },
} satisfies Story;

/**
 * As above but we started the next build
 */
export const PendingLocalBuildCapturing = {
  args: {
    ...EmptyBranchLocalBuildCapturing.args,
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests({ ...startedBuild, id: "2" }, inProgressTests),
        selectedBuild: withTests(pendingBuild, pendingTests),
      },
    },
  },
} satisfies Story;

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingLocalBuildCapturedStory = {
  args: {
    ...EmptyBranchLocalBuildCapturing.args,
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests({ ...startedBuild, id: "2" }, pendingTests),
        selectedBuild: withTests(pendingBuild, pendingTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
  // NOTE: this does not current work, the story is auto-selected
  // play: async ({ canvasElement, args, argsByTarget }) => {
  //   // We have to wait a moment for the story to render
  //   const canvas = within(canvasElement);
  //   await canvas.findAllByText("Latest");

  //   // Ensure we don't switch to the new build, the user has to opt-in
  //   mock(args.setSelectedBuildInfo!).mock.calls.forEach(([updater]) => {
  //     const result = typeof updater === "function" ? updater(args.selectedBuildInfo) : updater;
  //     expect(result).toEqual(args.selectedBuildInfo); // Unchanged
  //   });

  //   // Now opt in
  //   const viewLatestSnapshot = (await canvas.findAllByText("View latest snapshot"))[0];
  //   await userEvent.click(viewLatestSnapshot);

  //   const graphqlArgs = argsByTarget.graphql?.$graphql as typeof args.$graphql; // We need to type argsByTarget
  //   await waitFor(() => {
  //     expect(args.setSelectedBuildInfo).toHaveBeenCalledWith({
  //       buildId: graphqlArgs?.AddonVisualTestsBuild?.lastBuildOnBranch?.id,
  //       storyId: meta.args.storyId,
  //     });
  //   });
  // },
} satisfies Story;

/**
 * The next build is snapshotting but hasn't yet reached this story (we didn't start it)
 */
export const PendingCIBuildInProgress = {
  args: {
    selectedBuildInfo: PendingLocalBuildCapturing.args.selectedBuildInfo,
    $graphql: PendingLocalBuildCapturing.args.$graphql,
  },
} satisfies Story;

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingCIBuildCapturedStory = {
  args: {
    selectedBuildInfo: PendingLocalBuildCapturedStory.args.selectedBuildInfo,
    $graphql: PendingLocalBuildCapturedStory.args.$graphql,
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
  // NOTE: this does not current work, the story is auto-selected
  // Should behave the same as when the local build captures the current story
  // play: PendingLocalBuildCapturedStory.play,
} satisfies Story;

export const Pending = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  // @ts-expect-error Type conflict due to us explicitly defining `StoryArgs` above,
  // as it cannot be auto-inferred from meta
  render: ({ ...args }: typeof meta.args) => {
    // custom render for mapping `updateBuildStatus` to a function which is mocked, but returns data instead of a function
    return (
      <VisualTests
        {...args}
        updateBuildStatus={(fn) => args.updateBuildStatus(typeof fn === "function" ? fn({}) : fn)}
      />
    );
  },
  play: async ({ args }) => {
    await waitFor(() => {
      expect(args.updateBuildStatus).toHaveBeenCalledWith({
        "button--primary": {
          status: "warn",
          title: "Visual Tests",
          description: "Chromatic Visual Tests",
        },
      });
    });
  },
} satisfies Story;

export const NoPermission = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, pendingTests),
        userCanReview: false,
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const NoPermissionRunning = {
  args: {
    selectedBuildInfo: { buildId: startedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(startedBuild, inProgressTests),
        userCanReview: false,
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const NoPermissionNoChanges = {
  args: {
    selectedBuildInfo: { buildId: passedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(passedBuild, passedTests),
        userCanReview: false,
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const ToggleSnapshot: Story = {
  args: { ...Pending.args },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1782%3A446732&mode=design&t=krpUfPW0tIoADqu5-1"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByLabelText(canvasElement, "Show baseline snapshot");
    await fireEvent.click(button);
  }),
} satisfies Story;

export const Accepting = {
  args: { ...Pending.args },
  parameters: {
    ...withGraphQLMutationParameters("ReviewTest", () => delay("infinite")),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept this story" });
    await fireEvent.click(button);
  }),
} satisfies Story;

export const AcceptingFailed = {
  args: { ...Accepting.args },
  parameters: {
    ...withGraphQLMutationParameters("ReviewTest", () =>
      HttpResponse.json({ errors: [{ message: "Accepting failed" }] })
    ),
  },
  play: playAll(async ({ canvasElement, argsByTarget }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept this story" });
    await fireEvent.click(button);
    await waitFor(async () =>
      expect(argsByTarget["manager-api"].addNotification).toHaveBeenCalled()
    );
  }),
} satisfies Story;

export const Accepted = {
  args: {
    selectedBuildInfo: { buildId: acceptedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(acceptedBuild, acceptedTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const Skipped = {
  args: {
    storyId: "button--tertiary",
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(pendingBuild, [
          makeTest({
            id: "31",
            status: TestStatus.Passed,
            result: TestResult.Skipped,
            browsers,
            viewport: 1200,
            storyId: "button--tertiary",
          }),
        ]),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2255-42087&t=a8NRPgQk3kXMyxqZ-0"
    ),
  },
} satisfies Story;

export const CaptureError = {
  args: {
    selectedBuildInfo: { buildId: brokenBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(brokenBuild, brokenTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const InteractionFailure = {
  args: {
    selectedBuildInfo: { buildId: brokenBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests(brokenBuild, interactionFailureTests),
      },
    },
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const InfrastructureError = {
  args: {
    selectedBuildInfo: { buildId: failedBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: failedBuild,
      },
    },
  },
} satisfies Story;

/** The new build is newer than the story build (but we didn't run it) */
export const CIBuildNewer = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        selectedBuild: withTests(pendingBuild, pendingTests),
        lastBuildOnBranch: {
          ...withTests(pendingBuild, pendingTests),
          id: "2",
          committedAt: meta.args.gitInfo.committedAt,
        },
      },
    },
  },
  // Similarly to a captured story, we should only switch when the user is ready
  // NOTE: this does not current work, the story is auto-selected
  // play: PendingLocalBuildCapturedStory.play,
} satisfies Story;

/** The new build is newer than the story build and the git info */
export const CIBuildNewerThanCommit = {
  args: {
    selectedBuildInfo: { buildId: pendingBuild.id, storyId: meta.args.storyId },
    $graphql: {
      AddonVisualTestsBuild: {
        selectedBuild: withTests(pendingBuild, pendingTests),
        lastBuildOnBranch: {
          ...withTests(pendingBuild, pendingTests),
          id: "2",
          committedAt: meta.args.gitInfo.committedAt + 1,
        },
      },
    },
  },
  play: async ({ args }) => {
    // We should not switch
    mock(args.setSelectedBuildInfo!).mock.calls.forEach(([updater]) => {
      const result = typeof updater === "function" ? updater(args.selectedBuildInfo) : updater;
      expect(result).toEqual(args.selectedBuildInfo); // Unchanged
    });
  },
} satisfies Story;

// export const RenderSettings = {
//   parameters: {
//     ...withFigmaDesign(
//       "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-525764&t=18c1zI1SMe76dWYk-4"
//     ),
//   },
//   play: playAll(async ({ canvasElement }) => {
//     const button = await findByRole(canvasElement, "button", { name: "Show render settings" });
//     await fireEvent.click(button);
//   }),
// } satisfies Story;

// export const Warnings = {
//   parameters: {
//     ...withFigmaDesign(
//       "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=516-672810&t=18c1zI1SMe76dWYk-4"
//     ),
//   },
//   play: playAll(async ({ canvasElement }) => {
//     const button = await findByRole(canvasElement, "button", { name: "Show warnings" });
//     await fireEvent.click(button);
//   }),
// } satisfies Story;
