import { useStorybookApi } from "@storybook/manager-api";
import { useCallback, useRef, useState } from "react";

import { SharedState } from "./SharedState";

export function useSharedState<T>(key: string) {
  const channel = useStorybookApi().getChannel();
  if (!channel) throw new Error("Channel not available");

  const sharedState = useRef(SharedState.subscribe<T>(key, channel)).current;
  const [state, setState] = useState<T | undefined>(sharedState.value);

  sharedState.on("change", setState);

  return [
    state,
    useCallback(
      (newValue: T | undefined) => {
        setState(newValue);
        sharedState.value = newValue;
      },
      [sharedState]
    ),
  ] as const;
}
