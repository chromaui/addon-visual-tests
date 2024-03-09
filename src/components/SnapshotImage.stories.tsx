// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from "@storybook/react";
import { delay, http } from "msw";

import { ComparisonResult } from "../gql/graphql";
import { baseModes } from "../modes";
import { SnapshotImage } from "./SnapshotImage";

const meta = {
  component: SnapshotImage,
  args: {
    componentName: "Shapes",
    storyName: "Primary",
    baselineImage: { imageUrl: "/A.png", imageWidth: 880, imageHeight: 280 },
    latestImage: { imageUrl: "/B.png", imageWidth: 880, imageHeight: 280 },
    diffImage: { imageUrl: "/B-comparison.png", imageWidth: 880 },
    focusImage: { imageUrl: "/B-focus.png", imageWidth: 880 },
    comparisonResult: ComparisonResult.Changed,
    diffVisible: false,
    focusVisible: false,
    baselineImageVisible: false,
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

export const Default = {} satisfies Story;

export const BaselineVisible = {
  args: { baselineImageVisible: true },
} satisfies Story;

export const DiffVisible = {
  args: { diffVisible: true },
} satisfies Story;

export const FocusVisible = {
  args: { focusVisible: true },
} satisfies Story;

export const BothVisible = {
  args: { diffVisible: true, focusVisible: true },
} satisfies Story;

export const Wider = {
  args: {
    baselineImage: { imageUrl: "/shapes-taller.png", imageWidth: 588, imageHeight: 684 },
    latestImage: { imageUrl: "/shapes-wider.png", imageWidth: 768, imageHeight: 472 },
    diffImage: { imageUrl: "/shapes-comparison.png", imageWidth: 768 },
    focusImage: { imageUrl: "/shapes-focus.png", imageWidth: 768 },
    diffVisible: true,
    focusVisible: true,
  },
} satisfies Story;

export const WiderConstrained = {
  args: {
    ...Wider.args,
    style: { width: 400 },
  },
} satisfies Story;

export const Taller = {
  args: {
    baselineImage: { imageUrl: "/shapes-wider.png", imageWidth: 768, imageHeight: 472 },
    latestImage: { imageUrl: "/shapes-taller.png", imageWidth: 588, imageHeight: 684 },
    diffImage: { imageUrl: "/shapes-comparison.png", imageWidth: 768 },
    focusImage: { imageUrl: "/shapes-focus.png", imageWidth: 768 },
    diffVisible: true,
    focusVisible: true,
  },
} satisfies Story;

export const TallerConstrained = {
  args: {
    ...Taller.args,
    style: { width: 400 },
  },
} satisfies Story;

export const NoBaseline = {
  args: {
    baselineImage: undefined,
  },
} satisfies Story;

export const NoLatest = {
  args: {
    latestImage: undefined,
    baselineImageVisible: true,
  },
} satisfies Story;

export const CaptureError = {
  args: {
    baselineImage: undefined,
    latestImage: undefined,
    comparisonResult: ComparisonResult.CaptureError,
  },
} satisfies Story;

export const Loading = {
  ...BothVisible,
  parameters: {
    msw: {
      handlers: [http.get("/B.png", () => delay("infinite"))],
    },
  },
} satisfies Story;
