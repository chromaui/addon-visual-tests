import type { Channel } from 'storybook/internal/channels';

import { FETCH_ABORTED, FETCH_REQUEST, FETCH_RESPONSE } from '../constants.ts';

type ChannelLike = Pick<Channel, 'emit' | 'on' | 'off'>;

const instances = new Map<string, ChannelFetch>();

export class ChannelFetch {
  channel: ChannelLike;

  abortControllers: Map<string, AbortController>;

  constructor(channel: ChannelLike, _fetch = fetch) {
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
        const res = await _fetch(input as RequestInfo, { ...init, signal: controller.signal });
        const body = await res.text();
        const headers = Array.from(res.headers as any);
        const response = { body, headers, status: res.status, statusText: res.statusText };
        this.channel.emit(FETCH_RESPONSE, { requestId, response });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        this.channel.emit(FETCH_RESPONSE, { requestId, error });
      } finally {
        this.abortControllers.delete(requestId);
      }
    });
  }

  static subscribe(key: string, channel: ChannelLike, _fetch = fetch) {
    const instance = instances.get(key) || new ChannelFetch(channel, _fetch);
    if (!instances.has(key)) instances.set(key, instance);
    return instance;
  }
}
