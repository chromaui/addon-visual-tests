import { type Meta, type StoryObj } from "@storybook/react";
import React from "react";

import { Slider, SliderProvider } from "./Slider";
import { SnapshotImage } from "./SnapshotImage";
import SnapshotImageStories from "./SnapshotImage.stories";
import { ZoomContainer, ZoomProvider } from "./ZoomContainer";

const meta = {
  component: Slider,
  decorators: (Story) => (
    <SliderProvider>
      <Story />
    </SliderProvider>
  ),
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    left: <img src="/A.png" alt="" style={{ verticalAlign: "top" }} />,
    right: <img src="/B.png" alt="" style={{ verticalAlign: "top" }} />,
  },
};

export const Snapshots: Story = {
  args: {
    left: <SnapshotImage {...SnapshotImageStories.args} />,
    right: <SnapshotImage {...SnapshotImageStories.args} baselineImageVisible />,
  },
};

export const ZoomContainers: Story = {
  args: {
    left: (
      <ZoomContainer>
        <SnapshotImage {...SnapshotImageStories.args} />
      </ZoomContainer>
    ),
    right: (
      <ZoomContainer>
        <SnapshotImage {...SnapshotImageStories.args} baselineImageVisible />
      </ZoomContainer>
    ),
  },
  decorators: (Story) => (
    <ZoomProvider>
      <Story />
    </ZoomProvider>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Slider {...ZoomContainers.args} />
      <Slider {...ZoomContainers.args} />
      <Slider {...ZoomContainers.args} />
    </div>
  ),
  decorators: (Story) => (
    <ZoomProvider>
      <Story />
    </ZoomProvider>
  ),
};
