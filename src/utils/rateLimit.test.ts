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

  it('pauses for at least one second when the reset time has already passed', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        okResponse(rateLimitHeaders({ remaining: 0, resetAt: NOW_SECONDS - 5 }))
      )
      .mockResolvedValueOnce(okResponse(rateLimitHeaders()));
    const rateLimitedFetch = withRateLimit(fetchFn);

    await rateLimitedFetch('/api');
    const pending = rateLimitedFetch('/api');

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('resumes requests as soon as a response reports budget left in a newer window', async () => {
    let resolveInFlight!: (response: Response) => void;
    const fetchFn = vi
      .fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => (resolveInFlight = resolve)))
      .mockResolvedValueOnce(okResponse(rateLimitHeaders({ remaining: 0 })))
      .mockResolvedValue(okResponse(rateLimitHeaders({ resetAt: NOW_SECONDS + 60 })));
    const rateLimitedFetch = withRateLimit(fetchFn);

    const inFlight = rateLimitedFetch('/api');
    await rateLimitedFetch('/api'); // Starts a pause
    const paused = rateLimitedFetch('/api');

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    // The in-flight request comes back from a newer window, with budget left
    resolveInFlight(okResponse(rateLimitHeaders({ resetAt: NOW_SECONDS + 60 })));
    await inFlight;

    // The paused request still waits out its timer, but requests after it go out right away
    await rateLimitedFetch('/api');
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(getRateLimitState()).toMatchObject({ remaining: 990, resetAt: NOW_SECONDS + 60 });

    await vi.advanceTimersByTimeAsync(30_000);
    await paused;
  });

  it('ignores outdated responses that arrive out of order', async () => {
    const resolvers: ((response: Response) => void)[] = [];
    const fetchFn = vi
      .fn()
      .mockImplementation(() => new Promise<Response>((resolve) => resolvers.push(resolve)));
    const rateLimitedFetch = withRateLimit(fetchFn);

    const requests = [rateLimitedFetch('/api'), rateLimitedFetch('/api'), rateLimitedFetch('/api')];
    await vi.advanceTimersByTimeAsync(0);

    // Budget is exhausted
    resolvers[1](okResponse(rateLimitHeaders({ remaining: 0 })));
    await requests[1];
    // A response from earlier in the same window, reporting budget left
    resolvers[0](okResponse(rateLimitHeaders({ remaining: 5 })));
    await requests[0];
    expect(getRateLimitState()).toMatchObject({ remaining: 0 });

    const paused = rateLimitedFetch('/api');
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchFn).toHaveBeenCalledTimes(3);

    // A response from a newer window resumes requests
    resolvers[2](okResponse(rateLimitHeaders({ resetAt: NOW_SECONDS + 60 })));
    await requests[2];
    // A late response from the previous window doesn't pause them again
    const next = rateLimitedFetch('/api');
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchFn).toHaveBeenCalledTimes(4);
    resolvers[3](okResponse(rateLimitHeaders({ remaining: 0 })));
    await next;
    expect(getRateLimitState()).toMatchObject({ remaining: 990, resetAt: NOW_SECONDS + 60 });

    await vi.advanceTimersByTimeAsync(30_000);
    resolvers[4](okResponse(rateLimitHeaders({ resetAt: NOW_SECONDS + 60 })));
    await paused;
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

  it('uses the reset time from the error body of a 429 response', async () => {
    const limited = rateLimitedResponse(NOW_SECONDS + 10);
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(await limited.text(), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(okResponse());

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(9_999);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('waits for the last known reset time after a 429 response without any details', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(okResponse(rateLimitHeaders({ resetAt: NOW_SECONDS + 20 })))
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(okResponse());
    const rateLimitedFetch = withRateLimit(fetchFn);

    await rateLimitedFetch('/api');
    const pending = rateLimitedFetch('/api');

    await vi.advanceTimersByTimeAsync(19_999);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('waits the maximum after a 429 response when the reset time is unknown', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(okResponse());

    const pending = withRateLimit(fetchFn)('/api');

    await vi.advanceTimersByTimeAsync(59_999);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchFn).toHaveBeenCalledTimes(2);
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
