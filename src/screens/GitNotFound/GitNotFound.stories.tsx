// @ts-nocheck TODO: Address SB 8 type errors
import { mockChannel } from "@storybook/manager-api";
import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";

import { CONFIG_INFO, CONFIG_INFO_DISMISSED } from "../../constants";
import { ConfigInfoPayload } from "../../types";
import { SharedState } from "../../utils/SharedState";
import { GitNotFound } from "./GitNotFound";

const meta = {
  component: GitNotFound,
  args: {
    gitInfoError: new Error("Git info not found"),
  },
} satisfies Meta<typeof GitNotFound>;

export const Default = {} satisfies StoryObj<typeof meta>;

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

    return <GitNotFound {...args} />;
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

    return <GitNotFound {...args} />;
  },
} satisfies StoryObj<typeof meta>;

export default meta;
