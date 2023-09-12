import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";

import { playAll } from "../utils/playAll";
import { SidebarTopButton } from "./SidebarTopButton";

const meta = {
  component: SidebarTopButton,
  args: {
    startBuild: action("startBuild"),
  },
} satisfies Meta<typeof SidebarTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button", { name: "Run tests" });
    await userEvent.click(button);
  }),
};

export const Outdated: Story = {
  args: {
    isOutdated: true,
  },
};

export const IsRunning: Story = {
  args: {
    isRunning: true,
    runningBuild: {
      step: "build",
      buildProgressPercentage: 40,
    },
  },
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button", { name: "Run tests" });
    await userEvent.hover(button);
  }),
};
