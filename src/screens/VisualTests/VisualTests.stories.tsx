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
  tests: tests.map((test) => ({
    ...test,
    status: TestStatus.Passed,
    comparisons: test.comparisons.map((comparison) => ({
      ...comparison,
      result: ComparisonResult.Equal,
    })),
  })),
};

const pendingBuild = {
  ...inProgressBuild,
  status: BuildStatus.Pending,
  changeCount: 3,
  tests,
};

const acceptedBuild = {
  ...pendingBuild,
  status: BuildStatus.Accepted,
  tests: tests.map((test) => ({ ...test, status: TestStatus.Accepted })),
};

const meta = {
  component: VisualTests,
  decorators: [storyWrapper],
  parameters: {
    msw: {
      handlers: [
        graphql.query("ProjectQuery", (req, res, ctx) =>
          res(
            ctx.data({
              project: {
                id: "123",
                name: "acme",
                webUrl: "https://www.chromatic.com/passedBuilds?appId=123",
                lastBuild: {
                  branch: "main",
                  number: 123,
                },
              },
            })
          )
        ),
      ],
    },
  },
} satisfies Meta<typeof VisualTests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoChanges: Story = {
  args: {
    build: passedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304933&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Outdated: Story = {
  args: {
    build: passedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304922&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const InProgress: Story = {
  args: {
    build: inProgressBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304861&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Pending: Story = {
  args: {
    build: pendingBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-304718&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const Accepted: Story = {
  args: {
    build: acceptedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-305053&t=0rxMQnkxsVpVj1qy-4"
  ),
};

export const RenderSettings: Story = {
  args: {
    build: passedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=508-525764&t=18c1zI1SMe76dWYk-4"
  ),
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Show render settings" });
    await fireEvent.click(button);
  }),
};

export const Warnings: Story = {
  args: {
    build: passedBuild,
  },
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=516-672810&t=18c1zI1SMe76dWYk-4"
  ),
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", { name: "Show warnings" });
    await fireEvent.click(button);
  }),
};
