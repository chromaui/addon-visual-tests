import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import { ADDON_ID } from "../constants";
import { debounce } from "./debounce";

declare global {
  interface WindowEventMap {
    "session-storage": CustomEvent;
  }
}

export function useSessionState<S>(
  key: string,
  initialState?: S | (() => S)
): readonly [S, Dispatch<SetStateAction<S>>] {
  const readValue = useCallback(() => {
    try {
      const value = sessionStorage.getItem(`${ADDON_ID}/state/${key}`) as string;
      if (value !== undefined && value !== null) return JSON.parse(value) as S;
    } catch (e) {
      // Fall back to initial state
    }
    return typeof initialState === "function" ? (initialState as () => S)() : (initialState as S);
  }, [key, initialState]);

  const [state, setState] = useState<S>(readValue);

  const persist = useMemo(
    () =>
      debounce(
        key,
        (value: unknown) => {
          const stateKeys = new Set(sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";"));
          if (value === undefined || value === null) {
            sessionStorage.removeItem(`${ADDON_ID}/state/${key}`);
            stateKeys.delete(key);
          } else {
            sessionStorage.setItem(`${ADDON_ID}/state/${key}`, JSON.stringify(value));
            stateKeys.add(key);
          }
          sessionStorage.setItem(`${ADDON_ID}/state`, Array.from(stateKeys).join(";"));
          window.dispatchEvent(new StorageEvent("session-storage", { key }));
        },
        1000
      ),
    [key]
  );

  useEffect(() => persist.cancel, [persist]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      const storageEvent = event as StorageEvent;
      if (!storageEvent.key || storageEvent.key === key) setState(readValue());
    },
    [key, readValue]
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-storage", handleStorageChange);
    };
  }, [handleStorageChange]);

  return [
    state,
    useCallback(
      (update: S | ((currentValue: S) => S)) =>
        setState((currentValue: S | undefined) => {
          const newValue = typeof update === "function" ? (update as any)(currentValue) : update;
          persist(newValue);
          return newValue;
        }),
      [persist]
    ),
  ] as const;
}

export function clearSessionState(...keys: string[]) {
  const items = sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";") || [];
  if (keys.length) {
    keys.forEach((key) => sessionStorage.removeItem(`${ADDON_ID}/state/${key}`));
    sessionStorage.setItem(`${ADDON_ID}/state`, items.filter((i) => !keys.includes(i)).join(";"));
  } else {
    items.forEach((item) => sessionStorage.removeItem(`${ADDON_ID}/state/${item}`));
    sessionStorage.removeItem(`${ADDON_ID}/state`);
  }
}
