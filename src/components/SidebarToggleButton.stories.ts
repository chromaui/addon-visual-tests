import { action } from "@storybook/addon-actions";
import { type StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";

import { playAll } from "../utils/playAll";
import { SidebarToggleButton } from "./SidebarToggleButton";

export default {
  component: SidebarToggleButton,
  args: {
    count: 12,
    onEnable: action("onEnable"),
    onDisable: action("onDisable"),
  },
};

export const Default = {};

export const Enabled: StoryObj = {
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button");
    await userEvent.click(button);
  }),
};
