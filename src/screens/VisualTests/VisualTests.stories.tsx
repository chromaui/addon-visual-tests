import { VariablesOf } from "@graphql-typed-document-node/core";
import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import {
  findByRole,
  findByTestId,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@storybook/testing-library";
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
  withGraphQLQueryResultParameters,
} from "../../utils/gqlStoryHelpers";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeComparison, makeTest, makeTests } from "../../utils/storyData";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
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
import { VisualTests } from "./VisualTests";

const browsers = [Browser.Chrome, Browser.Safari];

const withBuilds = ({
  lastBuildOnBranch,
  selectedBuild: getSelectedBuild,
  userCanReview = true,
}: {
  selectedBuild?:
    | SelectedBuildFieldsFragment
    | ((selectedBuildId: string | undefined) => SelectedBuildFieldsFragment);
  lastBuildOnBranch?: LastBuildOnBranchBuildFieldsFragment;
  userCanReview?: boolean;
}) => {
  return withGraphQLQueryResultParameters(QueryBuild, ({ selectedBuildId }) => {
    const selectedBuild =
      typeof getSelectedBuild === "function" ? getSelectedBuild(selectedBuildId) : getSelectedBuild;
    return {
      project: {
        name: "acme",
        lastBuildOnBranch: lastBuildOnBranch || selectedBuild,
      },
      selectedBuild,
      viewer: {
        projectMembership: {
          userCanReview,
        },
      },
    };
  });
};

// Map the input args to result of the AddonVisualTestsBuild query
type LastOrSelectedBuildFragment = SelectedBuildFieldsFragment &
  LastBuildOnBranchBuildFieldsFragment;
type SelectedBuildInput =
  | {
      /** Choose the selected build from these based on selectedBuildId */
      selectedBuilds?: LastOrSelectedBuildFragment[];
    }
  | {
      /** Note the id of the selected build needs to match the selectedBuildId */
      selectedBuild?: LastOrSelectedBuildFragment;
    };
type QueryInput = SelectedBuildInput & {
  lastBuildOnBranch?: LastOrSelectedBuildFragment;
  userCanReview?: boolean;
};
function mapQuery(
  { lastBuildOnBranch, userCanReview = true, ...input }: QueryInput,
  { selectedBuildId }: VariablesOf<typeof QueryBuild>
) {
  const possibleSelectedBuilds =
    ("selectedBuild" in input && input.selectedBuild && [input.selectedBuild]) ||
    ("selectedBuilds" in input && input.selectedBuilds) ||
    [];
  if (lastBuildOnBranch) possibleSelectedBuilds.push(lastBuildOnBranch);
  const selectedBuild = possibleSelectedBuilds.find((b) => b.id === selectedBuildId);

  console.log({ possibleSelectedBuilds, lastBuildOnBranch, selectedBuild, selectedBuildId });
  return {
    project: {
      name: "acme",
      lastBuildOnBranch: lastBuildOnBranch || selectedBuild,
    },
    selectedBuild,
    viewer: {
      projectMembership: {
        userCanReview,
      },
    },
  };
}

type StoryArgs = Parameters<typeof VisualTests>[0] & {
  addNotification: () => void;
  $graphql?: { AddonVisualTestsBuild: QueryInput };
};
const meta = {
  title: "screens/VisualTests/VisualTests",
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: { chromatic: { modes: panelModes } },
  argTypes: {
    addNotification: { type: "function", target: "manager-api" },
    $graphql: {
      AddonVisualTestsBuild: { map: mapQuery },
    },
  },
  args: {
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
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({} as any), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const GraphQLError = {
  parameters: {
    ...withGraphQLQueryParameters("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.errors([{ message: "Something went wrong on the server" }]))
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
  parameters: {
    ...withBuilds({
      selectedBuild: undefined,
      lastBuildOnBranch: withTests(startedBuild, inProgressTests),
    }),
  },
  args: {
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

/** At this point, we should switch to the next build */
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
} satisfies Story;

/** Complete builds should always be switched to */
export const EmptyBranchCIBuildPending = {
  args: {
    $graphql: EmptyBranchLocalBuildCapturedCurrentStory.args.$graphql,
  },
  // In theory we might have a complete running build here, it should behave the same either way
} satisfies Story;

// There is a build, but this story is new (not on the build at all)
export const StoryAddedNotInBuild = {
  args: {
    $graphql: {
      AddonVisualTestsBuild: {
        selectedBuild: withTests({ ...pendingBuild }, []),
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
    $graphql: StoryAddedNotInBuild.args?.$graphql,
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

export const StoryAddedInLastBuildOnBranchNotInSelected = {
  args: {
    $graphql: {
      AddonVisualTestsBuild: {
        lastBuildOnBranch: withTests({ ...pendingBuild, id: "2" }, pendingTestsNewStory),
        selectedBuild: withTests(pendingBuild, []),
      },
    },
  },
} satisfies Story;

export const StoryAddedAndAccepted = {
  args: {
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
    ...NoChanges.args,
    gitInfo: { ...meta.args.gitInfo, branch: "new-branch" },
  },
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild, lastBuildOnBranch: undefined }),
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
    ...EmptyBranchStartedLocalBuild.args,
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
    ...EmptyBranchStartedLocalBuild.args,
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
} satisfies Story;

/**
 * The next build is snapshotting but hasn't yet reached this story (we didn't start it)
 */
export const PendingCIBuildInProgress = {
  args: {
    $graphql: PendingLocalBuildCapturing.args.$graphql,
  },
} satisfies Story;

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingCIBuildCapturedStory = {
  args: {
    $graphql: PendingLocalBuildCapturedStory.args.$graphql,
  },
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
} satisfies Story;

export const Pending = {
  args: {
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
    const button = await findByTestId(canvasElement, "button-toggle-snapshot");
    await fireEvent.click(button);
  }),
} satisfies Story;

export const Accepting = {
  args: { ...Pending.args },
  parameters: {
    ...withGraphQLMutationParameters("ReviewTest", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept" });
    await fireEvent.click(button);
  }),
} satisfies Story;

export const AcceptingFailed = {
  args: { ...Accepting.args },
  parameters: {
    ...withGraphQLMutationParameters("ReviewTest", (req, res, ctx) =>
      res(ctx.status(200), ctx.errors([{ message: "Accepting failed" }]))
    ),
  },
  play: playAll(async ({ canvasElement, argsByTarget }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept" });
    await fireEvent.click(button);
    await waitFor(async () =>
      expect(argsByTarget["manager-api"].addNotification).toHaveBeenCalled()
    );
  }),
} satisfies Story;

export const Accepted = {
  args: {
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
} satisfies Story;

/** The new build is newer than the story build and the git info */
export const CIBuildNewerThanCommit = {
  args: {
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
