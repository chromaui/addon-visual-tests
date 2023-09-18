import type { Channel } from "@storybook/channels";

import { getValue, GetValuePayload, setValue, SetValuePayload } from "./common";

class AddonState {
  private values: Record<string, any> = {};

  private listeners: Record<string, ((value: any) => unknown)[]> = {};

  get(key: string) {
    return this.values[key];
  }

  set(key: string, value: any) {
    this.values[key] = value;
    (this.listeners[key] || []).forEach((l) => l(value));
  }

  listen<T>(key: string, cb: (value: T) => unknown) {
    this.listeners[key] = [...(this.listeners[key] || []), cb];
  }

  // for testing
  reset() {
    this.values = {};
    this.listeners = {};
  }
}

const addonState = new AddonState();

let listening = false;
function ensureListening(channel: Pick<Channel, "emit" | "on">) {
  if (listening) return;

  channel.on(getValue, ({ key }: GetValuePayload) => {
    const value = addonState.get(key);
    if (value !== undefined) channel.emit(setValue, { key, value } satisfies SetValuePayload);
  });

  channel.on(setValue, ({ key, value }: SetValuePayload) => addonState.set(key, value));

  listening = true;
}

const requestedKeys = new Set<string>();
// For testing
export function resetAddonState() {
  addonState.reset();
  requestedKeys.clear();
  listening = false;
}

function apiGetAddonState<T>(channel: Pick<Channel, "emit" | "on">, key: string) {
  // Ask the universe for the value of the key if we've never seen it before
  if (!requestedKeys.has(key)) {
    channel.emit(getValue, { key } satisfies GetValuePayload);
    requestedKeys.add(key);
  }

  return addonState.get(key) as T | undefined;
}

function apiSetAddonState<T>(channel: Pick<Channel, "emit" | "on">, key: string, value: T) {
  addonState.set(key, value);

  channel.emit(setValue, { key, value } as SetValuePayload);
}

export function useAddonState<T>(channel: Pick<Channel, "emit" | "on">, key: string) {
  ensureListening(channel);

  return {
    get value(): T | undefined {
      return apiGetAddonState(channel, key);
    },

    set value(newValue: T | undefined) {
      apiSetAddonState(channel, key, newValue);
    },

    on(event: string, callback: (value: T) => unknown) {
      if (event !== "change") throw new Error("unsupported event");

      addonState.listen(key, callback);
    },
  };
}
