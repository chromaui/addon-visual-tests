import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { INITIAL_BUILD_PAYLOAD } from "../buildSteps";
import { BuildProgressInline } from "./BuildProgressBarInline";
import { Container } from "./Container";

const meta = {
  component: BuildProgressInline,
  render: (args) => (
    <Container>
      <BuildProgressInline {...args} />
    </Container>
  ),
} satisfies Meta<typeof BuildProgressInline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initialize: Story = {
  args: {
    localBuildProgress: INITIAL_BUILD_PAYLOAD,
  },
};

export const Build: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 8,
      currentStep: "build",
    },
  },
};

export const Upload: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 25,
      currentStep: "upload",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        upload: {
          startedAt: Date.now() - 3000,
          numerator: 4_200_000,
          denominator: 123_000_000,
        },
      },
    },
  },
};

export const Verify: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 50,
      currentStep: "verify",
    },
  },
};

export const Snapshot: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      buildProgressPercentage: 75,
      currentStep: "snapshot",
      stepProgress: {
        ...INITIAL_BUILD_PAYLOAD.stepProgress,
        snapshot: {
          startedAt: Date.now() - 5000,
          numerator: 25,
          denominator: 50,
        },
      },
    },
  },
};

export const Complete: Story = {
  args: {
    localBuildProgress: {
      ...INITIAL_BUILD_PAYLOAD,
      currentStep: "complete",
      buildProgressPercentage: 100,
    },
  },
};
