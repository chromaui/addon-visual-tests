import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { findByRole, userEvent } from "@storybook/testing-library";
import { rest } from "msw";

import { panelModes } from "../../modes";
import { storyWrapper } from "../../utils/graphQLClient";
import { playAll } from "../../utils/playAll";
import { withFigmaDesign } from "../../utils/withFigmaDesign";
import { Authentication } from "./Authentication";

const meta = {
  component: Authentication,
  decorators: [storyWrapper],
  args: {
    setAccessToken: action("setAccessToken"),
    hasProjectId: false,
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    msw: {
      handlers: [
        rest.post("*/authorize", (req, res, ctx) =>
          res(
            ctx.json({
              device_code: "chdc_95a7123d17a84851abcdefc869ec0741",
              user_code: "123 123",
              verification_uri: "https://www.chromatic.com/connect/chromaui:addon-visual-tests",
              verification_uri_complete:
                "https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123",
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
} satisfies Meta<typeof Authentication>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4"
  ),
};

export const HasProjectId: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4"
  ),
  args: {
    hasProjectId: true,
  },
};

export const SignIn: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317993&t=3EAIRe8423CpOQWY-4"
  ),
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, "button", {
      name: "Enable",
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const SSO = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/p4ZIW7diUWC2l2DAf5xpYI/Storybook-Connect-plugin-(EXTERNAL-USE)?type=design&node-id=1-1734&t=ysgtc5qR40kqRKtI-4"
  ),
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, "button", {
      name: "Sign into Chromatic with SSO",
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const Verify: Story = {
  parameters: withFigmaDesign(
    "https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318063&t=3EAIRe8423CpOQWY-4"
  ),
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, "button", {
      name: "Sign in with Chromatic",
    });
    await userEvent.click(button);
  }),
} satisfies Story;
