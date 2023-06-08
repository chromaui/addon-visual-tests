import { Meta, StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";

import { storyWrapper } from "../../storyWrapper";
import { Onboarding } from "./Onboarding";

const meta = {
  component: Onboarding,
  decorators: [storyWrapper],
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome = {};

export const SignIn: Story = {
  play: async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", {
      name: "Enable",
    });
    await userEvent.click(button);
  },
};

export const SSO: Story = {
  play: async (context) => {
    await SignIn.play(context);

    const button = await findByRole(context.canvasElement, "button", {
      name: "Sign into Chromatic with SSO",
    });
    await userEvent.click(button);
  },
};

export const Verify: Story = {
  play: async (context) => {
    await SignIn.play(context);

    const button = await findByRole(context.canvasElement, "button", {
      name: "Sign in with Chromatic",
    });
    await userEvent.click(button);
  },
};
