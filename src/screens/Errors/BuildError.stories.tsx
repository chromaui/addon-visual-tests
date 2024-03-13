import type { Meta, StoryObj } from "@storybook/react";

import { INITIAL_BUILD_PAYLOAD } from "../../buildSteps";
import { BuildError } from "./BuildError";

const meta = {
  component: BuildError,
  args: {
    localBuildProgress: {
      buildProgressPercentage: 50,
      currentStep: "error",
      stepProgress: INITIAL_BUILD_PAYLOAD.stepProgress,
      originalError: new Error("Caught exception in play function"),
    },
  },
} satisfies Meta<typeof BuildError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
