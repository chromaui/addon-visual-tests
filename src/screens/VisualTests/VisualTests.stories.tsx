import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, fireEvent } from "@storybook/testing-library";
import { graphql } from "msw";

import type { BuildQuery } from "../../gql/graphql";
import { Browser, BuildStatus, ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { StartedBuild, VisualTests } from "./VisualTests";

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

const tests = [
  {
    id: "1",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    comparisons: [
      {
        id: "11",
        browser: browser(Browser.Chrome),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
      },
      {
        id: "12",
        browser: browser(Browser.Safari),
        viewport: viewport(1200),
        result: ComparisonResult.Equal,
      },
    ],
    parameters: { viewport: viewport(1200) },
  },
  {
    id: "2",
    status: TestStatus.Pending,
    result: TestResult.Changed,
    comparisons: [
      {
        id: "21",
        browser: browser(Browser.Chrome),
        viewport: viewport(800),
        result: ComparisonResult.Equal,
      },
      {
        id: "22",
        browser: browser(Browser.Safari),
        viewport: viewport(800),
        result: ComparisonResult.Changed,
      },
    ],
    parameters: { viewport: viewport(800) },
  },
  {
    id: "3",
    status: TestStatus.Passed,
    result: TestResult.Equal,
    comparisons: [
      {
        id: "31",
        browser: browser(Browser.Chrome),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
      },
      {
        id: "32",
        browser: browser(Browser.Safari),
        viewport: viewport(400),
        result: ComparisonResult.Equal,
      },
    ],
    parameters: { viewport: viewport(400) },
  },
];

const paginated = (nodes: StartedBuild["tests"]["nodes"]) => ({
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

const inProgressBuild: StartedBuild = {
  __typename: "StartedBuild",
  id: "1",
  number: 1,
  branch: "feature-branch",
  commit: "1234567",
  browsers: [browser(Browser.Chrome), browser(Browser.Safari)],
  startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  status: BuildStatus.InProgress,
  changeCount: null,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.InProgress,
      result: null,
      comparisons: null,
    }))
  ),
};

const passedBuild: StartedBuild = {
  ...inProgressBuild,
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

const pendingBuild: StartedBuild = {
  ...inProgressBuild,
  status: BuildStatus.Pending,
  changeCount: 3,
  tests: paginated(tests),
};

const acceptedBuild: StartedBuild = {
  ...pendingBuild,
  status: BuildStatus.Accepted,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.Accepted,
    }))
  ),
};

const brokenBuild: StartedBuild = {
  ...inProgressBuild,
  status: BuildStatus.Pending,
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

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const withBuild = (build: StartedBuild) =>
  withGraphQLQuery("Build", (req, res, ctx) => res(ctx.data({ build } as BuildQuery)));

const meta = {
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: withBuild(passedBuild),
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
