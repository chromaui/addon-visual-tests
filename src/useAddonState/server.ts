import type { Channel } from "@storybook/channels";

import { getValue, GetValuePayload, setValue, SetValuePayload } from "./common";

class AddonState {
  private values: Record<string, any> = {};

  private listeners: Record<string, ((value: any) => null)[]> = {};

  get(key: string) {
    return this.values[key];
  }

  set(key: string, value: any) {
    this.values[key] = value;
    (this.listeners[key] || []).forEach((l) => l(value));
  }

  listen<T>(key: string, cb: (value: T) => null) {
    this.listeners[key] = [...(this.listeners[key] || []), cb];
  }
}

const addonState = new AddonState();

let listening = false;
function ensureListening(channel: Channel) {
  if (listening) return;

  channel.on(getValue, ({ key }: GetValuePayload) => {
    const value = addonState.get(key);
    if (value !== undefined) channel.emit(setValue, { key, value } satisfies SetValuePayload);
  });

  channel.on(setValue, ({ key, value }: SetValuePayload) => {
    addonState.set(key, value);
  });

  listening = true;
}

const requestedKeys = new Set<string>();
function apiGetAddonState<T>(channel: Channel, key: string) {
  // Ask the universe for the value of the key if we've never seen it before
  if (!requestedKeys.has(key)) {
    channel.emit(getValue, { key } satisfies GetValuePayload);
    requestedKeys.add(key);
  }

  return addonState.get(key) as T | undefined;
}

function apiSetAddonState<T>(channel: Channel, key: string, value: T) {
  addonState.set(key, value);

  channel.emit(setValue, { key, value } as SetValuePayload);
}

export function useAddonState<T>(channel: Channel, key: string) {
  ensureListening(channel);

  return {
    get value() {
      return apiGetAddonState(channel, key);
    },

    set value(newValue: T) {
      apiSetAddonState(channel, key, newValue);
    },

    on(event: string, callback: (value: T) => null) {
      if (event !== "change") throw new Error("unsupported event");

      addonState.listen(key, callback);
    },
  };
}
