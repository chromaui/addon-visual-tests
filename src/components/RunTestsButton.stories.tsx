import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { RunTestsButton } from "./RunTestsButton";

const meta = {
  component: RunTestsButton,
  args: {
    isStarting: false,
    projectId: "projectId",
    isLoggedIn: true,
    startBuild: action("startBuild"),
  },
} satisfies Meta<typeof RunTestsButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const IsStarting: Story = {
  args: { isStarting: true },
};
export const NoUser: Story = {
  args: { isLoggedIn: false },
};
export const NoProject: Story = {
  args: { projectId: undefined },
};
