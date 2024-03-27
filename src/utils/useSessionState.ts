import { Dispatch, SetStateAction, useCallback, useState } from "react";

const debounce = (callback: (...args: any[]) => unknown, wait: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
};

const persist = debounce((key, value) => {
  if (value === undefined) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, JSON.stringify(value));
}, 500);

export function useSessionState<S = undefined>(
  key: string,
  initialState?: undefined
): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

export function useSessionState<S>(
  key: string,
  initialState: S | (() => S)
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
