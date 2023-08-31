import type { API } from "@storybook/manager-api";
import { useStorybookApi } from "@storybook/manager-api";
import { useCallback } from "react";

import { getValue, GetValuePayload, setValue, SetValuePayload } from "./common";

const requestedKeys = new Set<string>();
let listening = false;
function ensureListening(api: API) {
  if (listening) return;

  api.on(getValue, ({ key }: GetValuePayload) => {
    const apiKey = `experimental_${key}`;
    const value = api.getAddonState(apiKey);
    if (value !== undefined) api.emit(setValue, { key, value } satisfies SetValuePayload);
  });

  api.on(setValue, ({ key, value }: SetValuePayload) => {
    const apiKey = `experimental_${key}`;
    api.setAddonState(apiKey, value);
  });

  listening = true;
}

function apiGetAddonState<T>(api: API, key: string) {
  const apiKey = `experimental_${key}`;

  // Ask the universe for the value of the key if we've never seen it before
  if (!requestedKeys.has(key)) {
    api.emit(getValue, { key } satisfies GetValuePayload);
    requestedKeys.add(key);
  }

  return api.getAddonState(apiKey) as T | undefined;
}
function apiSetAddonState<T>(api: API, key: string, value: T) {
  const apiKey = `experimental_${key}`;
  api.setAddonState(apiKey, value);

  api.emit(setValue, { key, value } satisfies SetValuePayload);
}

export function useAddonState<T>(key: string) {
  const api = useStorybookApi();

  // This should probably just always be happening
  ensureListening(api);

  return [
    apiGetAddonState(api, key),
    useCallback((value: T) => apiSetAddonState(api, key, value), [api, key]),
  ];
}
