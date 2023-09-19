import type { Meta, StoryObj } from "@storybook/react";

import { screenModes } from "../../modes";
import { LinkingProjectFailed } from "./LinkingProjectFailed";

const meta = {
  component: LinkingProjectFailed,
  args: {
    projectId: "Project:abc123",
    projectToken: "xzy789",
    configFile: "chromatic.config.json",
  },
  parameters: {
    chromatic: {
      modes: screenModes,
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
