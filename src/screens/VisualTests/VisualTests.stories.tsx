import { ResultOf } from "@graphql-typed-document-node/core";
import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, findByTestId, fireEvent, waitFor } from "@storybook/testing-library";
import { getOperationAST } from "graphql";
import { graphql } from "msw";
import React from "react";
import { TypedDocumentNode } from "urql";

import type {
  NextBuildFieldsFragment,
  StoryBuildFieldsFragment,
  StoryTestFieldsFragment,
} from "../../gql/graphql";
import { Browser, BuildStatus, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { AnnouncedBuild, PublishedBuild, StoryBuildWithTests } from "../../types";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeTest } from "../../utils/storyData";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { QueryBuild } from "./graphql";
import * as SnapshotComparisonStories from "./SnapshotComparison.stories";
import { VisualTests } from "./VisualTests";

const { tests: primaryTests } = SnapshotComparisonStories.default.args;
const browsers = [Browser.Chrome, Browser.Safari];

const withTests = <T extends StoryBuildWithTests>(
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
  nextBuild,
  storyBuild,
}: {
  storyBuild?: StoryBuildFieldsFragment;
  nextBuild?: NextBuildFieldsFragment;
}) => {
  return withGraphQLQueryResult(QueryBuild, {
    project: {
      name: "acme",
      nextBuild: nextBuild || storyBuild,
    },
    storyBuild,
  });
};

const meta = {
  title: "screens/VisualTests/VisualTests",
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: withBuilds({ storyBuild: passedBuild }),
  args: {
    gitInfo: {
      userEmailHash: "abc123",
      branch: "feature-branch",
      slug: "chromaui/addon-visual-tests",
      uncommittedHash: "",
      committedAt: Date.now() - 1000,
    },
    storyId: "button--primary",
    projectId: "Project:id123",
    startDevBuild: action("startDevBuild"),
    setAccessToken: action("setAccessToken"),
    updateBuildStatus: action("updateBuildStatus") as any,
  },
} satisfies Meta<typeof VisualTests>;

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

export const NoNextBuild: Story = {
  parameters: {
    ...withBuilds({ storyBuild: null }),
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

export const NoNextBuildRunningBuildStarting: Story = {
  ...NoNextBuild,
  args: {
    ...NoNextBuild.args,
    runningBuild: {
      step: "initialize",
    },
  },
};

export const NoNextBuildRunningBuildUploading: Story = {
  ...NoNextBuild,
  args: {
    ...NoNextBuild.args,
    runningBuild: {
      step: "upload",
      progress: 10,
      total: 100,
    },
  },
};

export const NoChanges: Story = {
  parameters: {
    ...withBuilds({ storyBuild: passedBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Outdated: Story = {
  args: {
    gitInfo: {
      ...meta.args.gitInfo,
      uncommittedHash: "1234abc",
    },
  },
  parameters: {
    ...withBuilds({ storyBuild: passedBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const OutdatedStarting: Story = {
  ...Outdated,
  args: {
    ...Outdated.args,
    runningBuild: {
      step: "initialize",
    },
  },
};

export const Announced: Story = {
  args: {},
  parameters: {
    ...withBuilds({ storyBuild: announcedBuild }),
  },
};

export const Published: Story = {
  args: {},
  parameters: {
    ...withBuilds({ storyBuild: publishedBuild }),
  },
};

export const InProgress: Story = {
  args: {
    runningBuild: {
      step: "snapshot",
      progress: 20,
      total: 100,
    },
  },
  parameters: {
    ...withBuilds({ storyBuild: inProgressBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

/**
 * The next build is snapshotting but hasn't yet reached this story
 */
export const NextBuildInProgress: Story = {
  ...InProgress,
  parameters: {
    ...withBuilds({ storyBuild: pendingBuild, nextBuild: { ...inProgressBuild, id: "2" } }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

/**
 * The next build is snapshotting and has captured this story
 */
export const NextBuildInProgressCapturedStory: Story = {
  ...InProgress,
  parameters: {
    ...withBuilds({
      storyBuild: pendingBuild,
      nextBuild: withTests(
        { ...inProgressBuild, id: "2" },
        SnapshotComparisonStories.WithSingleTest.args.tests
      ),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InProgressNoRunningBuild: Story = {
  parameters: {
    ...withBuilds({ storyBuild: inProgressBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const RunningBuildInProgress: Story = {
  ...InProgress,
  parameters: {
    ...withBuilds({ storyBuild: pendingBuild }),
  },
};

export const Pending: Story = {
  parameters: {
    ...withBuilds({ storyBuild: pendingBuild }),
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

export const ToggleSnapshot: Story = {
  parameters: {
    ...withBuilds({ storyBuild: pendingBuild }),
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
        ...withBuilds({ storyBuild: pendingBuild }).msw.handlers,
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

export const Accepted: Story = {
  parameters: {
    ...withBuilds({ storyBuild: acceptedBuild }),
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
      storyBuild: withTests(pendingBuild, [
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
    ...withBuilds({ storyBuild: brokenBuild }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InteractionFailure: Story = {
  parameters: {
    ...withBuilds({
      storyBuild: withTests(brokenBuild, SnapshotComparisonStories.InteractionFailure.args.tests),
    }),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InfrastructureError: Story = {
  parameters: {
    ...withBuilds({ storyBuild: failedBuild }),
  },
};

/** The new build is newer than the story build (but we didn't run it) */
export const NextBuildNewer: Story = {
  parameters: {
    ...withBuilds({
      storyBuild: pendingBuild,
      nextBuild: { ...pendingBuild, id: "2", committedAt: Date.now() - 1000 },
    }),
  },
};

/** The new build is newer than the story build and the git info */
export const NextBuildNewerThanCommit: Story = {
  parameters: {
    ...withBuilds({
      storyBuild: pendingBuild,
      nextBuild: { ...pendingBuild, id: "2", committedAt: Date.now() },
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
