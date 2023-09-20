import type { Meta, StoryObj } from "@storybook/react";

import { ComparisonResult } from "../gql/graphql";
import { baseModes } from "../modes";
import { SnapshotImage } from "./SnapshotImage";

const meta = {
  component: SnapshotImage,
  args: {
    componentName: "Shapes",
    storyName: "Primary",
    captureImage: { imageUrl: "/B.png", imageWidth: 880 },
    diffImage: { imageUrl: "/B-comparison.png", imageWidth: 880 },
    focusImage: { imageUrl: "/B-focus.png", imageWidth: 880 },
    comparisonResult: ComparisonResult.Changed,
    diffVisible: false,
    focusVisible: false,
  },
  parameters: {
    chromatic: {
      // No need to test these against a dark background
      modes: { ...baseModes, Dark: { disabled: true } },
    },
  },
} satisfies Meta<typeof SnapshotImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DiffVisible: Story = {
  args: { diffVisible: true },
};

export const FocusVisible: Story = {
  args: { focusVisible: true },
};

export const BothVisible: Story = {
  args: { diffVisible: true, focusVisible: true },
};

export const Wider: Story = {
  args: {
    captureImage: { imageUrl: "/shapes-wider.png", imageWidth: 768 },
    diffImage: { imageUrl: "/shapes-comparison.png", imageWidth: 768 },
    diffVisible: true,
  },
};

export const WiderConstrained: Story = {
  args: {
    ...Wider.args,
    style: { width: 400 },
  },
};

export const Taller: Story = {
  args: {
    captureImage: { imageUrl: "/shapes-taller.png", imageWidth: 588 },
    diffImage: { imageUrl: "/shapes-comparison.png", imageWidth: 768 },
    diffVisible: true,
  },
};

export const TallerConstrained: Story = {
  args: {
    ...Taller.args,
    style: { width: 400 },
  },
};

export const CaptureError: Story = {
  args: {
    captureImage: undefined,
    comparisonResult: ComparisonResult.CaptureError,
  },
};
