import type { Meta, StoryObj } from "@storybook/react";

import { LinkingProjectFailed } from "./LinkingProjectFailed";

const meta = {
  component: LinkingProjectFailed,
  args: {
    projectId: "Project:abc123",
    projectToken: "xzy789",
    configDir: ".storybook",
  },
} satisfies Meta<typeof LinkingProjectFailed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMainPath: Story = {
  args: {
    mainPath: "main.ts",
  },
};
