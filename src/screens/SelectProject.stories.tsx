import { Meta, StoryObj } from "@storybook/react";

import { storyWrapper } from "../storyWrapper";
import { SelectProject } from "./SelectProject";

const meta = {
  component: SelectProject,
  decorators: [storyWrapper],
} satisfies Meta<typeof SelectProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
