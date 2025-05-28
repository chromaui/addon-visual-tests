import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FETCH_ABORTED, FETCH_REQUEST, FETCH_RESPONSE } from '../constants';
import { ChannelFetch } from './ChannelFetch';
import { MockChannel } from './MockChannel';

const resolveAfter = (ms: number, value: any) =>
  new Promise((resolve) => setTimeout(resolve, ms, value));

const rejectAfter = (ms: number, reason: any) =>
  new Promise((_, reject) => setTimeout(reject, ms, reason));

describe('ChannelFetch', () => {
  let channel: MockChannel;

  beforeEach(() => {
    channel = new MockChannel();
  });

  it('should handle fetch requests', async () => {
    const fetch = vi.fn(() => resolveAfter(100, { headers: [], text: async () => 'data' }));
    ChannelFetch.subscribe('req', channel, fetch as any);

    channel.emit(FETCH_REQUEST, {
      requestId: 'req',
      input: 'https://example.com',
      init: { headers: { foo: 'bar' } },
    });

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://example.com', {
        headers: { foo: 'bar' },
        signal: expect.any(AbortSignal),
      });
    });
  });

  it('should send fetch responses', async () => {
    const fetch = vi.fn(() => resolveAfter(100, { headers: [], text: async () => 'data' }));
    const instance = ChannelFetch.subscribe('res', channel, fetch as any);

    const promise = new Promise<void>((resolve) => {
      channel.on(FETCH_RESPONSE, ({ response, error }) => {
        expect(response.body).toBe('data');
        expect(error).toBeUndefined();
        resolve();
      });
    });

    channel.emit(FETCH_REQUEST, { requestId: 'res', input: 'https://example.com' });
    await vi.waitFor(() => {
      expect(instance.abortControllers.size).toBe(1);
    });

    await promise;

    expect(instance.abortControllers.size).toBe(0);
  });

  it('should send fetch error responses', async () => {
    const fetch = vi.fn(() => rejectAfter(100, new Error('oops')));
    const instance = ChannelFetch.subscribe('err', channel, fetch as any);

    const promise = new Promise<void>((resolve) => {
      channel.on(FETCH_RESPONSE, ({ response, error }) => {
        expect(response).toBeUndefined();
        expect(error).toMatch(/oops/);
        resolve();
      });
    });

    channel.emit(FETCH_REQUEST, { requestId: 'err', input: 'https://example.com' });
    await vi.waitFor(() => {
      expect(instance.abortControllers.size).toBe(1);
    });

    await promise;
    expect(instance.abortControllers.size).toBe(0);
  });

  it('should abort fetch requests', async () => {
    const fetch = vi.fn((_input, _init) => new Promise<Response>(() => {}));
    const instance = ChannelFetch.subscribe('abort', channel, fetch);

    channel.emit(FETCH_REQUEST, { requestId: 'abort', input: 'https://example.com' });
    await vi.waitFor(() => {
      expect(instance.abortControllers.size).toBe(1);
    });

    channel.emit(FETCH_ABORTED, { requestId: 'abort' });
    await vi.waitFor(() => {
      expect(fetch.mock.lastCall?.[1].signal.aborted).toBe(true);
      expect(instance.abortControllers.size).toBe(0);
    });
  });
});
