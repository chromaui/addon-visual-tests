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
import { Browser, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { panelModes } from "../../modes";
import { SelectedBuildWithTests } from "../../types";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeTest } from "../../utils/storyData";
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
  startedBuild,
} from "./mocks";
import { VisualTests } from "./VisualTests";

const browsers = [Browser.Chrome, Browser.Safari];

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

function withGraphQLQueryResult<TQuery extends TypedDocumentNode<any, any>>(
  query: TQuery,
  result: ResultOf<TQuery>
) {
  const queryName = getOperationAST(query)?.name?.value;
  if (queryName) return withGraphQLQuery(queryName, (req, res, ctx) => res(ctx.data(result)));
  throw new Error(`Couldn't determine query name from query`);
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

const withTests = <T extends SelectedBuildWithTests>(
  build: T,
  fullTests: StoryTestFieldsFragment[]
) => ({
  ...build,
  testsForStatus: { nodes: fullTests },
  testsForStory: { nodes: fullTests },
});

const meta = {
  title: "screens/VisualTests/VisualTests",
  component: VisualTests,
  decorators: [storyWrapper, withManagerApi],
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild }),
    chromatic: {
      modes: panelModes,
    },
  },
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

export const Loading = {
  parameters: {
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const GraphQLError = {
  parameters: {
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.status(200), ctx.errors([{ message: "Something went wrong on the server" }]))
    ),
  },
} satisfies Story;

export const EmptyBranch = {
  parameters: {
    ...withBuilds({ selectedBuild: undefined }),
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
  parameters: {
    ...withBuilds({
      selectedBuild: undefined,
      lastBuildOnBranch: withTests(pendingBuild, pendingTests),
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
} satisfies Story;

/** Complete builds should always be switched to */
export const EmptyBranchCIBuildPending = {
  parameters: {
    ...withBuilds({
      selectedBuild: undefined,
      lastBuildOnBranch: withTests(pendingBuild, pendingTests),
    }),
  },
  // In theory we might have a complete running build here, it should behave the same either way
} satisfies Story;

export const NoChanges = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(passedBuild, passedTests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

/** We just switched branches so the selected build is out of date */
export const NoChangesOnWrongBranch: Story = {
  args: {
    gitInfo: { ...meta.args.gitInfo, branch: "new-branch" },
  },
  parameters: {
    ...withBuilds({ selectedBuild: passedBuild, lastBuildOnBranch: undefined }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

/**
 * We've started a new build but it's not done yet
 */
export const PendingLocalBuildStarting = {
  args: {
    ...EmptyBranchStartedLocalBuild.args,
  },
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
    }),
  },
} satisfies Story;

/**
 * As above but we started the next build
 */
export const PendingLocalBuildCapturing = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
      lastBuildOnBranch: withTests({ ...startedBuild, id: "2" }, inProgressTests),
    }),
  },
  args: {
    ...EmptyBranchLocalBuildCapturing.args,
  },
} satisfies Story;

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingLocalBuildCapturedStory = {
  ...PendingLocalBuildCapturing,
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
      lastBuildOnBranch: withTests({ ...startedBuild, id: "2" }, pendingTests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
} satisfies Story;

const pendingBuildNewStory = withTests(
  { ...pendingBuild },
  pendingTests.map((test) => ({
    ...test,
    result: TestResult.Added,
    comparisons: test.comparisons.map((comparison) => ({
      ...comparison,
      result: ComparisonResult.Added,
      baseCapture: null,
    })),
  }))
);

export const PendingBuildNewStory: Story = {
  parameters: {
    ...withBuilds({ selectedBuild: pendingBuildNewStory }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=1898-562751&mode=design&t=ciag0nGKx2OGmoSR-4"
    ),
  },
};

/**
 * The next build is snapshotting but hasn't yet reached this story (we didn't start it)
 */
export const PendingCIBuildInProgress = {
  parameters: PendingLocalBuildCapturing.parameters,
} satisfies Story;

/**
 * The next build is snapshotting and has captured this story
 */
export const PendingCIBuildCapturedStory = {
  parameters: {
    ...PendingLocalBuildCapturedStory.parameters,
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2303-374529&t=qjmuGHxoALrVuhvX-0"
    ),
  },
} satisfies Story;

export const Pending = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
    }),
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
} satisfies Story;

export const NoPermission = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
      userCanReview: false,
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const NoPermissionRunning = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(startedBuild, inProgressTests),
      userCanReview: false,
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const NoPermissionNoChanges = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(passedBuild, passedTests),
      userCanReview: false,
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2127-449276&mode=design&t=gIM40WT0324ynPQD-4"
    ),
  },
} satisfies Story;

export const ToggleSnapshot = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
    }),
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
  parameters: {
    msw: {
      handlers: [
        ...withBuilds({
          selectedBuild: withTests(pendingBuild, pendingTests),
        }).msw.handlers,
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
} satisfies Story;

export const AcceptingFailed = {
  parameters: {
    msw: {
      handlers: [
        ...withBuilds({
          selectedBuild: withTests(pendingBuild, pendingTests),
        }).msw.handlers,
        ...withGraphQLMutation("ReviewTest", (req, res, ctx) =>
          res(ctx.status(200), ctx.errors([{ message: "Accepting failed" }]))
        ).msw.handlers,
      ],
    },
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
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(acceptedBuild, acceptedTests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const Skipped = {
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
} satisfies Story;

export const CaptureError = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(brokenBuild, brokenTests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const InteractionFailure = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(brokenBuild, interactionFailureTests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
} satisfies Story;

export const InfrastructureError = {
  parameters: {
    ...withBuilds({
      selectedBuild: failedBuild,
    }),
  },
} satisfies Story;

/** The new build is newer than the story build (but we didn't run it) */
export const CIBuildNewer = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
      lastBuildOnBranch: {
        ...withTests(pendingBuild, pendingTests),
        id: "2",
        committedAt: meta.args.gitInfo.committedAt,
      },
    }),
  },
} satisfies Story;

/** The new build is newer than the story build and the git info */
export const CIBuildNewerThanCommit = {
  parameters: {
    ...withBuilds({
      selectedBuild: withTests(pendingBuild, pendingTests),
      lastBuildOnBranch: {
        ...withTests(pendingBuild, pendingTests),
        id: "2",
        committedAt: meta.args.gitInfo.committedAt + 1,
      },
    }),
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
