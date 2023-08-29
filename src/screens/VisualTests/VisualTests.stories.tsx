import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, findByTestId, fireEvent, waitFor } from "@storybook/testing-library";
import { graphql } from "msw";

import type {
  AddonVisualTestsBuildQuery,
  StatusTestFieldsFragment,
  StoryTestFieldsFragment,
} from "../../gql/graphql";
import { Browser, BuildStatus, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import {
  AnnouncedBuild,
  BuildWithTests,
  CompletedBuild,
  PublishedBuild,
  StartedBuild,
} from "../../types";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { makeBrowserInfo, makeTest } from "../../utils/storyData";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import * as SnapshotComparisonStories from "./SnapshotComparison.stories";
import { VisualTests } from "./VisualTests";

const { tests: primaryTests } = SnapshotComparisonStories.default.args;
const browsers = [Browser.Chrome, Browser.Safari];
const tests = [
  ...primaryTests,
  makeTest({
    id: "21",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    browsers,
    viewport: 1200,
    storyId: "button--secondary",
  }),
  makeTest({
    id: "31",
    status: TestStatus.Passed,
    result: TestResult.Skipped,
    browsers,
    viewport: 1200,
    storyId: "button--tertiary",
  }),
];

const paginated = (nodes: StatusTestFieldsFragment[] | StoryTestFieldsFragment[]) => ({
  edges: nodes.map((node) => ({ cursor: node.id, node })),
  nodes,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: nodes.at(0).id,
    endCursor: nodes.at(-1).id,
  },
  totalCount: nodes.length,
});

const withTests = <T extends BuildWithTests>(build: T, fullTests: StoryTestFieldsFragment[]) => ({
  ...build,
  testsForStatus: paginated(fullTests),
  testsForStory: paginated(fullTests),
});

const announcedBuild: AnnouncedBuild = {
  __typename: "AnnouncedBuild",
  id: "1",
  number: 1,
  branch: "feature-branch",
  commit: "1234567",
  uncommittedHash: "",
  browsers: [makeBrowserInfo(Browser.Chrome), makeBrowserInfo(Browser.Safari)],
  status: BuildStatus.Announced,
};

const publishedBuild: PublishedBuild = {
  ...(announcedBuild as any),
  __typename: "PublishedBuild",
  status: BuildStatus.Published,
};

const inProgressBuild: StartedBuild = withTests(
  {
    ...(publishedBuild as any),
    __typename: "StartedBuild",
    startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    status: BuildStatus.InProgress,
    changeCount: null,
  },
  SnapshotComparisonStories.InProgress.args.tests
);

const passedBuild: CompletedBuild = withTests(
  {
    ...(inProgressBuild as any),
    status: BuildStatus.Passed,
    changeCount: 0,
  },
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

const pendingBuild: CompletedBuild = withTests(
  {
    ...(inProgressBuild as any),
    status: BuildStatus.Pending,
    changeCount: 3,
  },
  primaryTests
);

const acceptedBuild: CompletedBuild = withTests(
  {
    ...pendingBuild,
    status: BuildStatus.Accepted,
  },
  primaryTests.map((test) => ({
    ...test,
    status: TestStatus.Accepted,
  }))
);

const brokenBuild: CompletedBuild = withTests(
  {
    ...(inProgressBuild as any),
    status: BuildStatus.Broken,
    changeCount: 0,
    brokenCount: 3,
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

const withGraphQLMutation = (...args: Parameters<typeof graphql.mutation>) => ({
  msw: {
    handlers: [graphql.mutation(...args)],
  },
});

const withBuild = (build: AnnouncedBuild | PublishedBuild | StartedBuild | CompletedBuild) =>
  withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
    res(ctx.data({ project: { name: "acme", lastBuild: build } } as AddonVisualTestsBuildQuery))
  );

const meta = {
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: withBuild(passedBuild),
  args: {
    gitInfo: {
      userEmailHash: "abc123",
      branch: "feature-branch",
      slug: "chromaui/addon-visual-tests",
      uncommittedHash: "",
    },
    storyId: "button--primary",
    projectId: "Project:id123",
    startDevBuild: action("startDevBuild"),
    isStarting: false,
    setAccessToken: action("setAccessToken"),
    updateBuildStatus: action("updateBuildStatus"),
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

export const NoBuild: Story = {
  parameters: {
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.data({ build: null } as AddonVisualTestsBuildQuery))
    ),
  },
};
export const NoBuildStarting: Story = {
  ...NoBuild,
  args: {
    isStarting: true,
    ...withGraphQLQuery("AddonVisualTestsBuild", (req, res, ctx) =>
      res(ctx.data({ build: null } as AddonVisualTestsBuildQuery))
    ),
    // No design for this state
    // ...withFigmaDesign(""),
  },
};

export const NoChanges: Story = {
  parameters: {
    ...withBuild(passedBuild),
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
    ...withBuild(passedBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const OutdatedStarting: Story = {
  ...Outdated,
  args: {
    ...Outdated.args,
    isStarting: true,
  },
};

export const Announced: Story = {
  args: {
    isStarting: true,
  },
  parameters: {
    ...withBuild(announcedBuild),
  },
};

export const Published: Story = {
  args: {
    isStarting: true,
  },
  parameters: {
    ...withBuild(publishedBuild),
  },
};

export const InProgress: Story = {
  parameters: {
    ...withBuild(inProgressBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Pending: Story = {
  parameters: {
    ...withBuild(pendingBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
  play: ({ args }) => {
    waitFor(() => {
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

export const PendingWithSecondBuildInProgress: Story = {
  ...Pending,
  args: {
    buildProgress: {
      step: "upload",
      progress: 1000,
      total: 2000,
    },
  },
};

export const ToggleSnapshot: Story = {
  parameters: {
    ...withBuild(pendingBuild),
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
        ...withBuild(pendingBuild).msw.handlers,
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
    ...withBuild(acceptedBuild),
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
    ...withBuild(
      withTests(
        pendingBuild,
        tests.filter(({ story }) => story.storyId === "button--tertiary")
      )
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=2255-42087&t=a8NRPgQk3kXMyxqZ-0"
    ),
  },
};

export const CaptureError: Story = {
  parameters: {
    ...withBuild(brokenBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InfrastructureError: Story = {
  parameters: {
    ...withBuild(failedBuild),
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
