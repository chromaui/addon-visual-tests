import type { Meta, StoryObj } from "@storybook/react";

import { Uninstalled } from "./Uninstalled";

const meta = {
  component: Uninstalled,
} satisfies Meta<typeof Uninstalled>;

export const Default = {} satisfies StoryObj<typeof meta>;

export default meta;
