import { mockChannel } from "storybook/internal/manager-api";
import type { Decorator } from "@storybook/react";
import React from "react";

import { SharedState } from "./SharedState";

export function withSharedState(key: string, value: any): Decorator {
  const state = SharedState.subscribe(key, mockChannel());
  const initialState = state.value;

  return function sharedStateDecorator(Story) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      state.value = value;
      return () => {
        state.value = initialState;
      };
    }, []);

    return <Story />;
  };
}
