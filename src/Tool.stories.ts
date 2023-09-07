import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";

import { ToolContent } from "./Tool";
import { playAll } from "./utils/playAll";

const meta = {
  component: ToolContent,
  args: {
    startBuild: action("startBuild"),
  },
} satisfies Meta<typeof ToolContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isRunning: false,
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
