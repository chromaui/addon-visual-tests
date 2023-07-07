import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, fireEvent } from "@storybook/testing-library";
import { graphql } from "msw";

import type { BuildQuery, TestFieldsFragment } from "../../gql/graphql";
import { Browser, BuildStatus, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { AnnouncedBuild, CompletedBuild, PublishedBuild, StartedBuild } from "../../types";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { VisualTests } from "./VisualTests";

const browser = (key: Browser) => ({
  id: key,
  key,
  name: key.slice(0, 1) + key.slice(1).toLowerCase(),
  version: "<unknown>",
});
const viewport = (width: number) => ({
  id: `_${width}`,
  name: `${width}px`,
  width,
  isDefault: width === 1200,
});

const headCapture = {
  captureImage: {
    imageUrl: "/B.png",
  },
};
const captureDiff = {
  diffImage: {
    imageUrl: "/B-comparison.png",
  },
};

const tests = [
  {
    id: "11",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    webUrl: "https://www.chromatic.com/test?appId=123&id=11",
    comparisons: [
      {
        id: "111",
        browser: browser(Browser.Chrome),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "112",
        browser: browser(Browser.Safari),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
    ],
    parameters: { viewport: viewport(1200) },
    story: { storyId: "button--primary" },
  },
  {
    id: "12",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    webUrl: "https://www.chromatic.com/test?appId=123&id=12",
    comparisons: [
      {
        id: "121",
        browser: browser(Browser.Chrome),
        viewport: viewport(800),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "122",
        browser: browser(Browser.Safari),
        viewport: viewport(800),
        result: ComparisonResult.Changed,
        headCapture,
        captureDiff,
      },
    ],
    parameters: { viewport: viewport(800) },
    story: { storyId: "button--primary" },
  },
  {
    id: "13",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    webUrl: "https://www.chromatic.com/test?appId=123&id=13",
    comparisons: [
      {
        id: "131",
        browser: browser(Browser.Chrome),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "132",
        browser: browser(Browser.Safari),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
        headCapture,
      },
    ],
    parameters: { viewport: viewport(400) },
    story: { storyId: "button--primary" },
  },

  {
    id: "21",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    webUrl: "https://www.chromatic.com/test?appId=123&id=21",
    comparisons: [
      {
        id: "211",
        browser: browser(Browser.Chrome),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
      {
        id: "212",
        browser: browser(Browser.Safari),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
        headCapture,
      },
    ],
    parameters: { viewport: viewport(1200) },
    story: { storyId: "button--secondary" },
  },
];

const paginated = (nodes: TestFieldsFragment[]) => ({
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

const announcedBuild: AnnouncedBuild = {
  __typename: "AnnouncedBuild",
  id: "1",
  number: 1,
  branch: "feature-branch",
  commit: "1234567",
  browsers: [browser(Browser.Chrome), browser(Browser.Safari)],
  status: BuildStatus.Announced,
};

const publishedBuild: PublishedBuild = {
  ...(announcedBuild as any),
  __typename: "PublishedBuild",
  status: BuildStatus.Published,
};

const inProgressBuild: StartedBuild = {
  ...(publishedBuild as any),
  __typename: "StartedBuild",
  startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  status: BuildStatus.InProgress,
  changeCount: null,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.InProgress,
      result: null,
      comparisons: [],
    }))
  ),
};

const passedBuild: CompletedBuild = {
  ...(inProgressBuild as any),
  status: BuildStatus.Passed,
  changeCount: 0,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.Passed,
      result: TestResult.Equal,
      comparisons: test.comparisons.map((comparison) => ({
        ...comparison,
        result: ComparisonResult.Equal,
      })),
    }))
  ),
};

const pendingBuild: CompletedBuild = {
  ...(inProgressBuild as any),
  status: BuildStatus.Pending,
  changeCount: 3,
  tests: paginated(tests),
};

const acceptedBuild: CompletedBuild = {
  ...pendingBuild,
  status: BuildStatus.Accepted,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.Accepted,
    }))
  ),
};

const brokenBuild: CompletedBuild = {
  ...(inProgressBuild as any),
  status: BuildStatus.Broken,
  changeCount: 3,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.Broken,
      result: TestResult.CaptureError,
      comparisons: test.comparisons.map((comparison) => ({
        ...comparison,
        result: ComparisonResult.CaptureError,
      })),
    }))
  ),
};

const failedBuild: PublishedBuild = {
  ...publishedBuild,
  status: BuildStatus.Failed,
};

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const withBuild = (build: AnnouncedBuild | PublishedBuild | StartedBuild | CompletedBuild) =>
  withGraphQLQuery("Build", (req, res, ctx) => res(ctx.data({ build } as BuildQuery)));

const meta = {
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: withBuild(passedBuild),
  args: {
    storyId: "button--primary",
  },
} satisfies Meta<typeof VisualTests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    ...withGraphQLQuery("Build", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
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
    isOutdated: true,
  },
  parameters: {
    ...withBuild(passedBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const OutdatedRunning: Story = {
  args: {
    ...Outdated.args,
    isRunning: true,
  },
  parameters: {
    ...Outdated.parameters,
  },
};

export const Announced: Story = {
  parameters: {
    ...withBuild(announcedBuild),
  },
};

export const Published: Story = {
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
};

export const Accepted: Story = {
  parameters: {
    ...withBuild(acceptedBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
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

export const RenderSettings: Story = {
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-525764&t=18c1zI1SMe76dWYk-4"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Show render settings" });
    await fireEvent.click(button);
  }),
};

export const Warnings: Story = {
  parameters: {
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=516-672810&t=18c1zI1SMe76dWYk-4"
    ),
  },
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Show warnings" });
    await fireEvent.click(button);
  }),
};
