// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { AuthProvider } from "../../AuthContext";
import { panelModes } from "../../modes";
import { storyWrapper } from "../../utils/storyWrapper";
import { LinkingProjectFailed } from "./LinkingProjectFailed";

const meta = {
  component: LinkingProjectFailed,
  args: {
    projectId: "Project:abc123",
    configFile: "chromatic.config.json",
  },
  decorators: [
    storyWrapper(AuthProvider, () => ({ value: { accessToken: "token", setAccessToken: fn() } })),
  ],
  parameters: {
    chromatic: {
      modes: panelModes,
    },
  },
} satisfies Meta<typeof LinkingProjectFailed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomConfig: Story = {
  args: {
    configFile: "production.chromatic.config.json",
  },
};
