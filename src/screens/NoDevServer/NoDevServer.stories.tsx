import type { Meta, StoryObj } from "@storybook/react";

import { NoDevServer } from "./NoDevServer";

const meta = {
  component: NoDevServer,
} satisfies Meta<typeof NoDevServer>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
