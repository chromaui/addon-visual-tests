import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/test";
import { fireEvent, userEvent } from "@storybook/testing-library";
import React from "react";

import { Container } from "./Container";
import { StatusDot } from "./StatusDot";
import { TooltipMenu } from "./TooltipMenu";

const meta = {
  component: TooltipMenu,
  args: {
    children: "Menu",
    note: "Click to open menu",
    links: [
      { id: "1", onClick: action("1"), title: "One" },
      { id: "2", onClick: action("2"), title: "Two" },
      { id: "3", onClick: action("3"), title: "Three" },
    ],
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof TooltipMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Hover = {
  play: async ({ canvasElement }) => {
    const buttons = await within(canvasElement).findAllByRole("button");
    buttons.forEach((button) => userEvent.hover(button));
  },
} satisfies Story;

export const Open = {
  play: async ({ canvasElement }) => {
    const buttons = await within(canvasElement).findAllByRole("button");
    buttons.forEach((button) => fireEvent.click(button));
  },
} satisfies Story;

export const Icons = {
  args: {
    links: [
      { id: "1", onClick: action("1"), title: "One", icon: "🍔" },
      { id: "2", onClick: action("2"), title: "Two", icon: "🍟" },
      { id: "3", onClick: action("3"), title: "Three", icon: "🥤" },
    ],
  },
  play: Open.play,
} satisfies Story;

export const Status = {
  args: {
    links: [
      { id: "1", onClick: action("1"), title: "One", right: <StatusDot status="negative" /> },
      { id: "2", onClick: action("2"), title: "Two", right: <StatusDot status="warning" /> },
      { id: "3", onClick: action("3"), title: "Three", right: <StatusDot status="positive" /> },
    ],
  },
  play: Open.play,
} satisfies Story;
