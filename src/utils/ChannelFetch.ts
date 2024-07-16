import type { Channel } from "@storybook/channels";

export const FETCH_ABORTED = "ChannelFetch/aborted";
export const FETCH_REQUEST = "ChannelFetch/request";
export const FETCH_RESPONSE = "ChannelFetch/response";

type ChannelLike = Pick<Channel, "emit" | "on" | "off">;

const instances = new Map<string, ChannelFetch>();

export class ChannelFetch {
  channel: ChannelLike;

  abortControllers: Map<string, AbortController>;

  constructor(channel: ChannelLike) {
    this.channel = channel;
    this.abortControllers = new Map<string, AbortController>();

    this.channel.on(FETCH_ABORTED, ({ requestId }) => {
      this.abortControllers.get(requestId)?.abort();
      this.abortControllers.delete(requestId);
    });

    this.channel.on(FETCH_REQUEST, async ({ requestId, input, init }) => {
      const controller = new AbortController();
      this.abortControllers.set(requestId, controller);

      try {
        const res = await fetch(input as RequestInfo, { ...init, signal: controller.signal });
        const body = await res.text();
        const headers = Array.from(res.headers as any);
        const response = { body, headers, status: res.status, statusText: res.statusText };
        this.channel.emit(FETCH_RESPONSE, { requestId, response });
      } catch (error) {
        this.channel.emit(FETCH_RESPONSE, { requestId, error });
      } finally {
        this.abortControllers.delete(requestId);
      }
    });
  }

  static subscribe<T>(key: string, channel: ChannelLike) {
    const instance = instances.get(key) || new ChannelFetch(channel);
    if (!instances.has(key)) instances.set(key, instance);
    return instance;
  }
}
