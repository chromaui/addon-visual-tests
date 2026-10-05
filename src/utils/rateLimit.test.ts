import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __testUtils,
  getRateLimitState,
  parseRateLimitHeaders,
  RATE_LIMIT_ERROR_CODE,
  withRateLimit,
} from './rateLimit';

const NOW = new Date('2026-01-01T00:00:00Z').getTime();
const NOW_SECONDS = NOW / 1000;

const rateLimitHeaders = ({
  limit = 1000,
  remaining = 990,
  resetAt = NOW_SECONDS + 30,
}: { limit?: number; remaining?: number; resetAt?: number } = {}) => ({
  'x-ratelimit-limit': String(limit),
  'x-ratelimit-remaining': String(remaining),
  'x-ratelimit-used': String(limit - remaining),
  'x-ratelimit-reset': String(resetAt),
  'x-ratelimit-resource': 'graphql',
});

const jsonResponse = (body: unknown, headers: Record<string, string> = {}, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const okResponse = (headers?: Record<string, string>) =>
  jsonResponse({ data: { viewer: null } }, headers);

const rateLimitedResponse = (resetAt = NOW_SECONDS + 10) =>
  jsonResponse({
    data: null,
    errors: [
      {
        message: 'Rate limit exceeded',
        extensions: {
          code: RATE_LIMIT_ERROR_CODE,
          rateLimit: { limit: 1000, remaining: 0, used: 1000, resetAt },
        },
      },
    ],
  });

describe('parseRateLimitHeaders', () => {
  it('parses the rate limit headers', () => {
    expect(parseRateLimitHeaders(new Headers(rateLimitHeaders()))).toEqual({
      limit: 1000,
      remaining: 990,
      used: 10,
      resetAt: NOW_SECONDS + 30,
      resource: 'graphql',
    });
  });

  it('returns null when headers are missing or invalid', () => {
    expect(parseRateLimitHeaders(new Headers())).toBeNull();
    expect(
      parseRateLimitHeaders(new Headers({ ...rateLimitHeaders(), 'x-ratelimit-remaining': 'nope' }))
    ).toBeNull();
  });
});

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    __testUtils.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('passes responses through and tracks the rate limit state', async () => {
    const response = okResponse(rateLimitHeaders());
    const fetchFn = vi.fn().mockResolvedValue(response);

    await expect(withRateLimit(fetchFn)('/api')).resolves.toBe(response);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(getRateLimitState()).toMatchObject({ remaining: 990 });
  });

  it('passes responses through when there are no rate limit headers', async () => {
    const response = okResponse();
    const fetchFn = vi.fn().mockResolvedValue(response);

    await expect(withRateLimit(fetchFn)('/api')).resolves.toBe(response);
    expect(getRateLimitState()).toBeNull();
  });

  it('holds back requests until the window resets when the budget is exhausted', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(okResponse(rateLimitHeaders({ remaining: 0 })))
      .mockResolvedValueOnce(okResponse(rateLimitHeaders()));
    const rateLimitedFetch = withRateLimit(fetchFn);

    await rateLimitedFetch('/api');
    const pending = rateLimitedFetch('/api');

    await vi.advanceTimersByTimeAsync(29_000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('retries a RATE_LIMITED request once the window resets', async () => {
    const response = okResponse(rateLimitHeaders());
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(NOW_SECONDS + 10))
      .mockResolvedValueOnce(response);

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(9_000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toBe(response);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('retries a 429 response after Retry-After', async () => {
    const response = okResponse();
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { 'Retry-After': '5' } }))
      .mockResolvedValueOnce(response);

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toBe(response);
  });

  it('holds back other requests while waiting to retry', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(NOW_SECONDS + 10))
      .mockResolvedValue(okResponse());
    const rateLimitedFetch = withRateLimit(fetchFn);

    const first = rateLimitedFetch('/api');
    await vi.advanceTimersByTimeAsync(0);
    const second = rateLimitedFetch('/api');

    await vi.advanceTimersByTimeAsync(9_000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await Promise.all([first, second]);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('gives up after a limited number of retries and returns the rate limited response', async () => {
    const fetchFn = vi.fn().mockImplementation(async () => rateLimitedResponse(NOW_SECONDS + 10));

    const pending = withRateLimit(fetchFn)('/api');
    await vi.advanceTimersByTimeAsync(60_000);

    const response = await pending;
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(await response.json()).toMatchObject({
      errors: [{ extensions: { code: RATE_LIMIT_ERROR_CODE } }],
    });
  });

  it('waits at least one second before retrying, even if the reset time has passed', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(NOW_SECONDS - 10))
      .mockResolvedValueOnce(okResponse());

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('never waits longer than the rate limit window, regardless of clock skew', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(rateLimitedResponse(NOW_SECONDS + 3600))
      .mockResolvedValueOnce(okResponse());

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(60_000);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does not treat other GraphQL errors as rate limiting', async () => {
    const response = jsonResponse({ errors: [{ message: 'Must login' }] });
    const fetchFn = vi.fn().mockResolvedValue(response);

    await expect(withRateLimit(fetchFn)('/api')).resolves.toBe(response);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('rejects when the request is aborted while waiting', async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(rateLimitedResponse(NOW_SECONDS + 10));
    const controller = new AbortController();

    const pending = withRateLimit(fetchFn)('/api', { signal: controller.signal });
    const assertion = expect(pending).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(1_000);
    controller.abort();

    await assertion;
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
