import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { TOOL_ID } from "../constants";
import { RunTestsButton } from "./RunTestsButton";

const meta = {
  component: RunTestsButton,
  args: {
    isStarting: false,
    projectId: "projectId",
    accessToken: "accessToken",
    startBuild: action("startBuild"),
    key: TOOL_ID,
  },
} satisfies Meta<typeof RunTestsButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const IsStarting: Story = {
  args: { isStarting: true },
};
export const NoUser: Story = {
  args: { accessToken: undefined },
};
export const NoProject: Story = {
  args: { projectId: undefined },
};
