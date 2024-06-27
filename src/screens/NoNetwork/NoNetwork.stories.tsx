import type { Meta, StoryObj } from "@storybook/react";

import { NoNetwork } from "./NoNetwork";

const meta = {
  component: NoNetwork,
  args: {
    aborted: false,
    online: true,
  },
} satisfies Meta<typeof NoNetwork>;

export default meta;

export const Default = {} satisfies StoryObj<typeof meta>;

export const Aborted = {
  args: {
    aborted: true,
  },
} satisfies StoryObj<typeof meta>;

export const Offline = {
  args: {
    online: false,
  },
} satisfies StoryObj<typeof meta>;
