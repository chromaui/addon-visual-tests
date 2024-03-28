import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ADDON_ID } from "../constants";

const debounce = (callback: (...args: any[]) => unknown, wait: number) => {
  let timeoutId: number;
  const cancel = () => {
    window.clearTimeout(timeoutId);
    timeoutId = 0;
  };
  const debounced = (...args: any[]) => {
    if (timeoutId) cancel();
    else callback(...args); // Leading edge call

    timeoutId = window.setTimeout(() => {
      callback(...args); // Trailing edge call
      timeoutId = 0;
    }, wait);
  };
  debounced.cancel = cancel;
  return debounced;
};

export function useSessionState<S>(
  key: string,
  initialState?: S | (() => S)
): readonly [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    try {
      const value = sessionStorage.getItem(`${ADDON_ID}/state/${key}`) as string;
      if (value !== undefined && value !== null) return JSON.parse(value) as S;
    } catch (e) {
      // Fall back to initial state
    }
    return typeof initialState === "function" ? (initialState as () => S)() : (initialState as S);
  });

  const persist = useMemo(
    () =>
      debounce((value: unknown) => {
        const stateKeys = new Set(sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";"));
        if (value === undefined || value === null) {
          sessionStorage.removeItem(`${ADDON_ID}/state/${key}`);
          stateKeys.delete(key);
        } else {
          sessionStorage.setItem(`${ADDON_ID}/state/${key}`, JSON.stringify(value));
          stateKeys.add(key);
        }
        sessionStorage.setItem(`${ADDON_ID}/state`, Array.from(stateKeys).join(";"));
      }, 5000),
    [key]
  );

  useEffect(() => persist.cancel, [persist]);

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
