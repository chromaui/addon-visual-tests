import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { ADDON_ID } from "../constants";

const debounce = (callback: (...args: any[]) => unknown, wait: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
};

const persist = debounce((key, value) => {
  const storageKey = `${ADDON_ID}/state/${key}`;
  const items = sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";") || [];
  if (value === undefined) {
    sessionStorage.removeItem(storageKey);
    sessionStorage.setItem(`${ADDON_ID}/state`, items.filter((i) => i !== key).join(";"));
  } else {
    sessionStorage.setItem(storageKey, JSON.stringify(value));
    sessionStorage.setItem(`${ADDON_ID}/state`, items.concat(key).join(";"));
  }
}, 500);

export function useSessionState<S>(
  key: string,
  initialState?: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key) as string) as S;
    } catch (e) {
      return typeof initialState === "function" ? (initialState as () => S)() : (initialState as S);
    }
  });

  return [
    state,
    useCallback(
      (update: S | ((currentValue: S) => S)) =>
        setState((value: S | undefined) => {
          const newValue = typeof update === "function" ? (update as any)(value) : update;
          persist(key, newValue);
          return newValue;
        }),
      [key]
    ),
  ] as const;
}

export function clearSessionState() {
  const items = sessionStorage.getItem(`${ADDON_ID}/state`)?.split(";") || [];
  items.forEach((key) => sessionStorage.removeItem(`${ADDON_ID}/state/${key}`));
}
