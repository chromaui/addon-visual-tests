import { action } from "@storybook/addon-actions";
import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/testing-library";

import { INITIAL_BUILD_PAYLOAD } from "../buildSteps";
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
    await screen.findAllByRole("button", { name: "Rerun tests" });
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
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 40,
      currentStep: "build",
    },
  },
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button", { name: "Run tests" });
    await userEvent.hover(button);
    await screen.findAllByText("🏗 Building your Storybook...");
  }),
};
