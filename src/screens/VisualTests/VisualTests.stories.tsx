import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, fireEvent } from "@storybook/testing-library";
import { graphql } from "msw";

import { BuildStatus, ComparisonResult, TestStatus } from "../../gql/graphql";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { VisualTests } from "./VisualTests";

const tests = [
  {
    id: "1",
    status: TestStatus.Passed,
    comparisons: [
      { browser: "chrome", viewport: "1200px", result: ComparisonResult.Equal },
      { browser: "safari", viewport: "1200px", result: ComparisonResult.Equal },
    ],
  },
  {
    id: "2",
    status: TestStatus.Pending,
    comparisons: [
      { browser: "chrome", viewport: "800px", result: ComparisonResult.Equal },
      { browser: "safari", viewport: "800px", result: ComparisonResult.Changed },
    ],
  },
  {
    id: "3",
    status: TestStatus.Passed,
    comparisons: [
      { browser: "chrome", viewport: "400px", result: ComparisonResult.Equal },
      { browser: "safari", viewport: "400px", result: ComparisonResult.Equal },
    ],
  },
];

const paginated = (nodes: { id: string; [x: string]: any }[]) => ({
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

const inProgressBuild = {
  branch: "feature-branch",
  status: BuildStatus.InProgress,
  startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  tests: tests.map((test) => ({
    ...test,
    status: TestStatus.InProgress,
    comparisons: null,
  })),
};

const passedBuild = {
  ...inProgressBuild,
  status: BuildStatus.Passed,
  changeCount: 0,
  tests: paginated(
    tests.map((test) => ({
      ...test,
      status: TestStatus.Passed,
      comparisons: test.comparisons.map((comparison) => ({
        ...comparison,
        result: ComparisonResult.Equal,
      })),
    }))
  ),
};

const pendingBuild = {
  ...inProgressBuild,
  status: BuildStatus.Pending,
  changeCount: 3,
  tests: paginated(tests),
};

const acceptedBuild = {
  ...pendingBuild,
  status: BuildStatus.Accepted,
  tests: paginated(tests.map((test) => ({ ...test, status: TestStatus.Accepted }))),
};

const withGraphQLQuery = (...args: Parameters<typeof graphql.query>) => ({
  msw: {
    handlers: [graphql.query(...args)],
  },
});

const withLastBuild = (lastBuild: any) =>
  withGraphQLQuery("LastBuildQuery", (req, res, ctx) =>
    res(
      ctx.data({
        project: {
          id: "123",
          name: "acme",
          webUrl: "https://www.chromatic.com/builds?appId=123",
          lastBuild,
        },
      })
    )
  );

const meta = {
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: withLastBuild(passedBuild),
} satisfies Meta<typeof VisualTests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    ...withGraphQLQuery("LastBuildQuery", (req, res, ctx) =>
      res(ctx.status(200), ctx.data({}), ctx.delay("infinite"))
    ),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const NoChanges: Story = {
  parameters: {
    ...withLastBuild(passedBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Outdated: Story = {
  parameters: {
    ...withLastBuild(passedBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const InProgress: Story = {
  parameters: {
    ...withLastBuild(inProgressBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Pending: Story = {
  parameters: {
    ...withLastBuild(pendingBuild),
    ...withFigmaDesign(
      "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
    ),
  },
};

export const Accepted: Story = {
  parameters: {
    ...withLastBuild(acceptedBuild),
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
