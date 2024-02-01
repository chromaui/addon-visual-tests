import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Container } from "./Container";
import { SnapshotImageThumb } from "./SnapshotImageThumb";

const meta = {
  component: SnapshotImageThumb,
  args: {
    thumbnailUrl: "/B.png",
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof SnapshotImageThumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Positive = {
  args: {
    status: "positive",
  },
} satisfies Story;

export const Small = {
  args: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    thumbnailUrl: "/capture-16b798d6.png",
  },
} satisfies Story;
