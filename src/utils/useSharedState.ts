import { useStorybookApi } from "@storybook/manager-api";
import { useCallback, useEffect, useRef, useState } from "react";

import { SharedState } from "./SharedState";

export function useSharedState<S>(key: string) {
  const channel = useStorybookApi().getChannel();
  if (!channel) throw new Error("Channel not available");

  const sharedStateRef = useRef(SharedState.subscribe<S>(key, channel));
  const [state, setState] = useState<S | undefined>(sharedStateRef.current.value);

  useEffect(() => {
    const sharedState = sharedStateRef.current;
    sharedState.on("change", setState);
    return () => sharedState.off("change", setState);
  }, [sharedStateRef]);

  return [
    state,
    useCallback(
      (update: S | undefined | ((currentValue: S) => S | undefined)) =>
        setState((currentValue: S | undefined) => {
          const newValue = typeof update === "function" ? (update as any)(currentValue) : update;
          sharedStateRef.current.value = newValue;
          return newValue;
        }),
      []
    ),
  ] as const;
}
