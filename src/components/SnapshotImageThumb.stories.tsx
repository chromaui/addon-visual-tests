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
    thumbnailUrl: "/capture-16b798d6.png",
  },
} satisfies Story;

export const BackgroundColor = {
  args: {
    backgroundColor: "#313d4c",
  },
} satisfies Story;

export const TransparentBackground = {
  args: {
    backgroundColor: "rbga(0, 0, 0, 0)",
  },
} satisfies Story;
