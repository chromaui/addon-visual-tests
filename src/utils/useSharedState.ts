import { useStorybookApi } from "@storybook/manager-api";
import { useCallback, useEffect, useRef, useState } from "react";

import { SharedState } from "./SharedState";

export function useSharedState<T>(key: string) {
  const channel = useStorybookApi().getChannel();
  if (!channel) throw new Error("Channel not available");

  const sharedStateRef = useRef(SharedState.subscribe<T>(key, channel));
  const [state, setState] = useState<T | undefined>(sharedStateRef.current.value);

  useEffect(() => {
    const sharedState = sharedStateRef.current;
    sharedState.on("change", setState);
    return () => sharedState.off("change", setState);
  }, [sharedStateRef]);

  return [
    state,
    useCallback(
      (newValue: T | undefined) => {
        setState(newValue);
        sharedStateRef.current.value = newValue;
      },
      [sharedStateRef]
    ),
  ] as const;
}
