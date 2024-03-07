import type { Meta, StoryObj } from "@storybook/react";

import { BuildLimited } from "./BuildLimited";

const meta = {
  component: BuildLimited,
  args: {
    localBuildProgress: {
      buildProgressPercentage: 50,
      currentStep: "error",
      stepProgress: {},
      errorDetailsUrl: "https://www.chromatic.com/billing?accountId=5af25af03c9f2c4bdccc0fcb",
    },
  },
} satisfies Meta<typeof BuildLimited>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
