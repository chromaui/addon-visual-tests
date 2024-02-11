import { mockChannel } from "@storybook/manager-api";
import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";

import { CONFIG_INFO, CONFIG_INFO_DISMISSED } from "../constants";
import { ConfigInfoPayload } from "../types";
import { SharedState } from "../utils/SharedState";
import { Screen } from "./Screen";

const meta = {
  component: Screen,
  args: {
    children: "Hello, world!",
  },
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConfigurationProblems = {
  render: (args) => {
    const state = SharedState.subscribe<ConfigInfoPayload>(CONFIG_INFO, mockChannel());

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      state.value = {
        problems: { storybookBaseDir: "src/frontend" },
        suggestions: { zip: true },
      };
      return () => {
        state.value = null;
      };
    }, [state]);

    return <Screen {...args} />;
  },
} satisfies StoryObj<typeof meta>;

export const ConfigurationSuggestions = {
  render: (args) => {
    const state = SharedState.subscribe<ConfigInfoPayload>(CONFIG_INFO, mockChannel());

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      state.value = { suggestions: { zip: true } };
      return () => {
        state.value = null;
        localStorage.removeItem(CONFIG_INFO_DISMISSED);
      };
    }, [state]);

    return <Screen {...args} />;
  },
} satisfies StoryObj<typeof meta>;
