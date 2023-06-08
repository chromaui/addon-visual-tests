import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";
import { rest } from "msw";

import { storyWrapper } from "../../storyWrapper";
import { Onboarding } from "./Onboarding";

const meta = {
  component: Onboarding,
  decorators: [storyWrapper],
  args: {
    setAccessToken: action("setAccessToken"),
  },
  parameters: {
    msw: {
      handlers: [
        rest.post("*/authorize", (req, res, ctx) =>
          res(
            ctx.json({
              device_code: "chdc_95a7123d17a84851abcdefc869ec0741",
              user_code: "123 123",
              verification_uri: "https://www.chromatic.com/connect/storybook-visual-tests",
              verification_uri_complete:
                "https://www.chromatic.com/connect/storybook-visual-tests?code=123123",
              expires_in: 300,
              interval: 5,
            })
          )
        ),
        rest.post("*/token", (req, res, ctx) =>
          res(
            ctx.json({
              error: "authorization_pending",
              error_description: "Authorization is pending approval",
            })
          )
        ),
      ],
    },
  },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {};

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
