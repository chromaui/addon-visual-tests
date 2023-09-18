import type { ResultOf } from "@graphql-typed-document-node/core";
import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { API, State } from "@storybook/manager-api";
import { ManagerContext } from "@storybook/manager-api";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { findByRole, findByTestId, fireEvent, waitFor } from "@storybook/testing-library";
import { getOperationAST } from "graphql";
import { graphql } from "msw";
import React from "react";
import { TypedDocumentNode } from "urql";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import type {
  LastBuildOnBranchBuildFieldsFragment,
  SelectedBuildFieldsFragment,
  StoryTestFieldsFragment,
} from "../../gql/graphql";
import { Browser, BuildStatus, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { AnnouncedBuild, PublishedBuild, SelectedBuildWithTests } from "../../types";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeTest } from "../../utils/storyData";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { QueryBuild } from "./graphql";
import * as SnapshotComparisonStories from "./SnapshotComparison.stories";
import { VisualTests } from "./VisualTests";

const { tests: primaryTests } = SnapshotComparisonStories.default.args;
const browsers = [Browser.Chrome, Browser.Safari];

const withTests = <T extends SelectedBuildWithTests>(
  build: T,
  fullTests: StoryTestFieldsFragment[]
) => ({
  ...build,
  testsForStatus: { nodes: fullTests },
  testsForStory: { nodes: fullTests },
});

const announcedBuild = {
  __typename: "AnnouncedBuild",
  id: "1",
  number: 1,
  branch: "feature-branch",
  commit: "abc123",
  committedAt: Date.now() - 2000,
  uncommittedHash: "",
  status: BuildStatus.Announced,
} satisfies AnnouncedBuild;

const publishedBuild = {
  ...announcedBuild,
  __typename: "PublishedBuild",
  status: BuildStatus.Published,
} satisfies PublishedBuild;

const inProgressBuild = withTests(
  {
    ...publishedBuild,
    __typename: "StartedBuild",
    startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    status: BuildStatus.InProgress,
    changeCount: null,
  },
  SnapshotComparisonStories.InProgress.args.tests
);

const passedBuild = withTests(
  { ...inProgressBuild, status: BuildStatus.Passed },
  primaryTests.map((test) => ({
    ...test,
    status: TestStatus.Passed,
    result: TestResult.Equal,
    comparisons: test.comparisons.map((comparison) => ({
      ...comparison,
      result: ComparisonResult.Equal,
    })),
  }))
);

const pendingBuild = withTests({ ...inProgressBuild, status: BuildStatus.Pending }, primaryTests);

const acceptedBuild = withTests(
  { ...pendingBuild, status: BuildStatus.Accepted },
  primaryTests.map((test) => ({
    ...test,
    status: TestStatus.Accepted,
  }))
);

const brokenBuild = withTests(
  {
    ...inProgressBuild,
    status: BuildStatus.Broken,
  },
  primaryTests.map((test) => ({
    ...test,
    status: TestStatus.Broken,
    result: TestResult.CaptureError,
    comparisons: test.comparisons.map((comparison) => ({
      ...comparison,
      headCapture: null,
      result: ComparisonResult.CaptureError,
    })),
  }))
);

const failedBuild: PublishedBuild = {
  ...publishedBuild,
  status: BuildStatus.Failed,
};

const withManagerApi: Decorator = (Story, { argsByTarget }) => (
  <ManagerContext.Provider
    value={{
      api: { addNotification: argsByTarget["manager-api"].addNotification } as API,
      state: {} as State,
    }}
  >
    <Story />
  </ManagerContext.Provider>
);

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

function withGraphQLQueryResult<TQuery extends TypedDocumentNode>(
  query: TQuery,
  result: ResultOf<TQuery>
) {
  const queryName = getOperationAST(query).name.value;
  return withGraphQLQuery(queryName, (req, res, ctx) => res(ctx.data(result)));
}

const withGraphQLMutation = (...args: Parameters<typeof graphql.mutation>) => ({
  msw: {
    handlers: [graphql.mutation(...args)],
  },
});

const withBuilds = ({
  lastBuildOnBranch,
  selectedBuild,
  userCanReview = true,
}: {
  selectedBuild?: SelectedBuildFieldsFragment;
  lastBuildOnBranch?: LastBuildOnBranchBuildFieldsFragment;
  userCanReview?: boolean;
}) => {
  return withGraphQLQueryResult(QueryBuild, {
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
  });
};

const meta = {
  title: "screens/VisualTests/VisualTests",
  component: VisualTests,
  decorators: [storyWrapper, withManagerApi],
  parameters: withBuilds({ selectedBuild: passedBuild }),
  argTypes: {
    addNotification: { type: "function", target: "manager-api" },
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
  },
} satisfies Meta<Parameters<typeof VisualTests>[0] & { addNotification: () => void }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const GraphQLError: Story = {
  parameters: {
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.errors([{ message: "Something went wrong on the server" }]))
    ),
  },
};

export const EmptyBranch: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: null }),
  },
  render: ({ ...args }) => {
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
};

export const EmptyBranchStartedLocalBuild: Story = {
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
};

export const EmptyBranchLocalBuildUploading: Story = {
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
};

/** This story should maintain the "no build" UI with a progress bar */
export const EmptyBranchLocalBuildCapturing: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: null, lastBuildOnBranch: inProgressBuild }),
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
};

/** At this point, we should switch to the next build */
export const EmptyBranchLocalBuildCapturedCurrentStory: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: null,
      lastBuildOnBranch: withTests(
        inProgressBuild,
        SnapshotComparisonStories.WithSingleTest.args.tests
      ),
    }),
  },
  args: {
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
};

/** Complete builds should always be switched to */
export const EmptyBranchCIBuildPending: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: null,
      lastBuildOnBranch: pendingBuild,
    }),
  },
  // In theory we might have a complete running build here, it should behave the same either way
};

export const NoChanges: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

/** We just switched branches so the selected build is out of date */
export const NoChangesOnWrongBranch: Story = {
  args: {
    gitInfo: { ...meta.args.gitInfo, branch: "new-branch" },
  },
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild, lastBuildOnBranch: null }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

/**
 * We've started a new build but it's not done yet
 */
export const PendingLocalBuildStarting: Story = {
  args: {
    ...EmptyBranchStartedLocalBuild.args,
  },
  parameters: {
    ...withBuilds({ selectedBuild: pendingBuild }),
  },
};

/**
 * As above but we started the next build
 */
export const PendingLocalBuildCapturing: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: pendingBuild,
      lastBuildOnBranch: { ...inProgressBuild, id: "2" },
    }),
  },
  args: {
    ...EmptyBranchLocalBuildCapturing.args,
  },
};

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingLocalBuildCapturedStory: Story = {
  ...PendingLocalBuildCapturing,
  parameters: {
    ...withBuilds({
      selectedBuild: pendingBuild,
      lastBuildOnBranch: withTests(
        { ...inProgressBuild, id: "2" },
        SnapshotComparisonStories.WithSingleTest.args.tests
      ),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
};

/**
 * The next build is snapshotting but hasn't yet reached this story (we didn't start it)
 */
export const PendingCIBuildInProgress: Story = {
  parameters: PendingLocalBuildCapturing.parameters,
};

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingCIBuildCapturedStory: Story = {
  parameters: {
    ...PendingLocalBuildCapturedStory.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
};

export const Pending: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: pendingBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  render: ({ ...args }) => {
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
};

export const NoPermission: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: pendingBuild, userCanReview: false }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
};

export const NoPermissionRunning: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: inProgressBuild, userCanReview: false }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
};

export const NoPermissionNoChanges: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild, userCanReview: false }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
};

export const ToggleSnapshot: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: pendingBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1782%3A446732&mode=design&t=krpUfPW0tIoADqu5-1"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByTestId(canvasElement, "button-toggle-snapshot");
    await fireEvent.click(button);
  }),
};

export const Accepting: Story = {
  parameters: {
    msw: {
      handlers: [
        ...withBuilds({ selectedBuild: pendingBuild }).msw.handlers,
        ...withGraphQLMutation("ReviewTest", (req, res, ctx) =>
          res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
        ).msw.handlers,
      ],
    },
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept" });
    await fireEvent.click(button);
  }),
};

export const AcceptingFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        ...withBuilds({ selectedBuild: pendingBuild }).msw.handlers,
        ...withGraphQLMutation("ReviewTest", (req, res, ctx) =>
          res(ctx.status(200), ctx.errors([{ message: "Accepting failed" }]))
        ).msw.handlers,
      ],
    },
  },
  play: playAll(async ({ canvasElement, argsByTarget, args, argTypes }) => {
    const button = await findByRole(canvasElement, "button", { name: "Accept" });
    await fireEvent.click(button);
    await waitFor(async () =>
      expect(argsByTarget["manager-api"].addNotification).toHaveBeenCalled()
    );
  }),
};

export const Accepted: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: acceptedBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Skipped: Story = {
  args: {
    storyId: "button--tertiary",
  },
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, [
        makeTest({
          id: "31",
          status: TestStatus.Passed,
          result: TestResult.Skipped,
          browsers,
          viewport: 1200,
          storyId: "button--tertiary",
        }),
      ]),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2255-42087&t=a8NRPgQk3kXMyxqZ-0"
    ),
  },
};

export const CaptureError: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: brokenBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InteractionFailure: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(
        brokenBuild,
        SnapshotComparisonStories.InteractionFailure.args.tests
      ),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InfrastructureError: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: failedBuild }),
  },
};

/** The new build is newer than the story build (but we didn't run it) */
export const CIBuildNewer: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: pendingBuild,
      lastBuildOnBranch: { ...pendingBuild, id: "2", committedAt: meta.args.gitInfo.committedAt },
    }),
  },
};

/** The new build is newer than the story build and the git info */
export const CIBuildNewerThanCommit: Story = {
  parameters: {
    ...withBuilds({
      selectedBuild: pendingBuild,
      lastBuildOnBranch: {
        ...pendingBuild,
        id: "2",
        committedAt: meta.args.gitInfo.committedAt + 1,
      },
    }),
  },
};

// export const RenderSettings: Story = {
//   parameters: {
//     ...withFigmaDesign(
//       "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-525764&t=18c1zI1SMe76dWYk-4"
//     ),
//   },
//   play: playAll(async ({ canvasElement }) => {
//     const button = await findByRole(canvasElement, "button", { name: "Show render settings" });
//     await fireEvent.click(button);
//   }),
// };

// export const Warnings: Story = {
//   parameters: {
//     ...withFigmaDesign(
//       "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=516-672810&t=18c1zI1SMe76dWYk-4"
//     ),
//   },
//   play: playAll(async ({ canvasElement }) => {
//     const button = await findByRole(canvasElement, "button", { name: "Show warnings" });
//     await fireEvent.click(button);
//   }),
// };
