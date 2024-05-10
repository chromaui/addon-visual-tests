import type { Meta, StoryObj } from "@storybook/react";

import { NoNetwork } from "./NoNetwork";

const meta = {
  component: NoNetwork,
} satisfies Meta<typeof NoNetwork>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
