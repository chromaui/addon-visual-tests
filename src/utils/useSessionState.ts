import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { ADDON_ID } from "../constants";

const debounce = (callback: (...args: any[]) => unknown, wait: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = 0;
    } else {
      // Leading edge call
      callback(...args);
    }
    timeoutId = window.setTimeout(() => {
      // Trailing edge call
      callback(...args);
      timeoutId = 0;
    }, wait);
  };
};

const persist = (key: string) =>
  debounce((value: unknown) => {
    const storageKey = `${ADDON_ID}/state/${key}`;
    const stateKeys = new Set(sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";"));
    if (value === undefined || value === null) {
      sessionStorage.removeItem(storageKey);
      stateKeys.delete(key);
    } else {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
      stateKeys.add(key);
    }
    sessionStorage.setItem(`${ADDON_ID}/state`, Array.from(stateKeys).join(";"));
  }, 500);

export function useSessionState<S>(
  key: string,
  initialState?: S | (() => S)
): readonly [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    try {
      const value = sessionStorage.getItem(key) as string;
      if (value !== undefined && value !== null) return JSON.parse(value) as S;
    } catch (e) {
      // ignore
    }
    return typeof initialState === "function" ? (initialState as () => S)() : (initialState as S);
  });

  return [
    state,
    useCallback(
      (update: S | ((currentValue: S) => S)) =>
        setState((currentValue: S | undefined) => {
          const newValue = typeof update === "function" ? (update as any)(currentValue) : update;
          persist(key)(newValue);
          return newValue;
        }),
      [key]
    ),
  ] as const;
}

export function clearSessionState() {
  const items = sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";") || [];
  items.forEach((key) => sessionStorage.removeItem(`${ADDON_ID}/state/${key}`));
  sessionStorage.removeItem(`${ADDON_ID}/state`);
}
