import type { Channel } from "@storybook/channels";

export const GET_VALUE = `experimental_useSharedState_getValue`;
export const SET_VALUE = `experimental_useSharedState_setValue`;

export class SharedState<T = any> {
  channel: Pick<Channel, "emit" | "on" | "off">;

  state: { [key: string]: { index: number; value: T | undefined } };

  constructor(channel: Pick<Channel, "emit" | "on" | "off">) {
    this.channel = channel;
    this.state = {};

    this.channel.on(SET_VALUE, (key: string, value: T | undefined, index: number) => {
      if (this.state?.[key]?.index >= index) return;
      this.state[key] = { index, value };
    });

    this.channel.on(GET_VALUE, (key: string) => {
      const index = this.state[key]?.index ?? 0;
      const value = this.state[key]?.value;
      this.channel.emit(SET_VALUE, key, value, index);
    });
  }

  get(key: string) {
    if (!this.state[key]) this.channel.emit(GET_VALUE, key);
    return this.state[key]?.value;
  }

  set(key: string, value: T | undefined) {
    const index = (this.state[key]?.index ?? 0) + 1;
    this.state[key] = { index, value };
    this.channel.emit(SET_VALUE, key, value, index);
  }

  static subscribe<T>(key: string, channel: Pick<Channel, "emit" | "on" | "off">) {
    const sharedState = new SharedState<T>(channel);
    const listeners: ((value: T | undefined) => void)[] = [];

    sharedState.channel.on(SET_VALUE, (k: string, v: T | undefined) => {
      if (k !== key) return;
      listeners.forEach((listener) => listener(v));
    });

    return {
      get value(): T | undefined {
        return sharedState.get(key);
      },

      set value(newValue: T | undefined) {
        sharedState.set(key, newValue);
      },

      on(event: "change", callback: (value: T | undefined) => void) {
        if (event !== "change") throw new Error("unsupported event");
        listeners.push(callback);
      },

      off(event: "change", callback: (value: T | undefined) => void) {
        if (event !== "change") throw new Error("unsupported event");
        const index = listeners.indexOf(callback);
        if (index >= 0) listeners.splice(index, 1);
      },
    };
  }
}
