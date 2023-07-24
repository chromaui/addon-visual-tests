import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { Browser, BuildStatus } from "../../gql/graphql";
import { makeBrowserInfo } from "../../utils/storyData";
import { BuildInfo } from "./BuildInfo";

const meta = {
  component: BuildInfo,
  args: {
    isOutdated: false,
    runDevBuild: action("runDevBuild"),
  },
} satisfies Meta<typeof BuildInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgressUnstarted: Story = {
  args: {
    build: {
      status: BuildStatus.InProgress,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
  },
};

export const InProgress: Story = {
  args: {
    build: {
      status: BuildStatus.InProgress,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 0,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
  },
};

export const Pending: Story = {
  args: {
    build: {
      status: BuildStatus.Pending,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 10,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
  },
};

export const Passed: Story = {
  args: {
    build: {
      status: BuildStatus.Passed,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 0,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
  },
};

export const PassedOutdated: Story = {
  args: {
    build: {
      status: BuildStatus.Passed,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 0,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
    isOutdated: true,
  },
};
export const Accepted: Story = {
  args: {
    build: {
      status: BuildStatus.Accepted,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 10,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 1,
  },
};

export const PendingManyViewportsAndBrowsers: Story = {
  args: {
    build: {
      status: BuildStatus.Pending,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 10,
      brokenCount: 0,
      browsers: [
        makeBrowserInfo(Browser.Chrome),
        makeBrowserInfo(Browser.Firefox),
        makeBrowserInfo(Browser.Safari),
      ],
    },
    viewportCount: 2,
  },
};

export const Broken: Story = {
  args: {
    build: {
      status: BuildStatus.Broken,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 0,
      brokenCount: 10,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 0,
  },
};

export const Failed: Story = {
  args: {
    build: {
      status: BuildStatus.Failed,
      startedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      changeCount: 0,
      brokenCount: 0,
      browsers: [makeBrowserInfo(Browser.Chrome)],
    },
    viewportCount: 0,
  },
};
