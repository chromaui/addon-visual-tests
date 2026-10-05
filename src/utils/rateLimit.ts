// GitHub-style rate limit response headers for the public API complexity budget.
// https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api#checking-the-status-of-your-primary-rate-limit
export const RATE_LIMIT_HEADERS = {
  /** Maximum points allowed in the current rate limit window */
  limit: 'x-ratelimit-limit',
  /** Points remaining in the current window */
  remaining: 'x-ratelimit-remaining',
  /** Points consumed in the current window */
  used: 'x-ratelimit-used',
  /** UTC epoch seconds when the current window resets */
  reset: 'x-ratelimit-reset',
  /** Which rate limit resource the request counted against (e.g. `graphql`) */
  resource: 'x-ratelimit-resource',
} as const;

// GraphQL error `extensions.code` returned when the budget is exhausted.
export const RATE_LIMIT_ERROR_CODE = 'RATE_LIMITED';

export interface RateLimitState {
  limit: number;
  remaining: number;
  used: number;
  /** UTC epoch seconds when the current window resets */
  resetAt: number;
  resource?: string;
}

// Never wait longer than this. Guards against clock skew between the client and the server, which
// would otherwise stall requests indefinitely.
const MAX_WAIT_MS = 60_000;

// When retrying a rate limited request, always wait at least this long, so a client clock that runs
// ahead of the server doesn't cause us to hammer the API with immediate retries.
const MIN_RETRY_WAIT_MS = 1_000;

// How many times to retry a single request after it got rate limited.
const MAX_RETRIES = 2;

let currentState: RateLimitState | null = null;

// Epoch milliseconds until which requests are held back.
let pausedUntil = 0;

const toNumber = (value: unknown) => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : undefined;
};

export const parseRateLimitHeaders = (headers: Headers): RateLimitState | null => {
  const limit = toNumber(headers.get(RATE_LIMIT_HEADERS.limit));
  const remaining = toNumber(headers.get(RATE_LIMIT_HEADERS.remaining));
  const resetAt = toNumber(headers.get(RATE_LIMIT_HEADERS.reset));
  if (limit === undefined || remaining === undefined || resetAt === undefined) return null;

  const used = toNumber(headers.get(RATE_LIMIT_HEADERS.used)) ?? limit - remaining;
  const resource = headers.get(RATE_LIMIT_HEADERS.resource) ?? undefined;
  return { limit, remaining, used, resetAt, ...(resource && { resource }) };
};

const parseRateLimitExtension = (value: unknown): RateLimitState | null => {
  if (!value || typeof value !== 'object') return null;
  const { limit, remaining, used, resetAt } = value as Record<string, unknown>;
  const state = {
    limit: toNumber(limit),
    remaining: toNumber(remaining),
    used: toNumber(used),
    resetAt: toNumber(resetAt),
  };
  if (state.limit === undefined || state.remaining === undefined || state.resetAt === undefined) {
    return null;
  }
  return { ...state, used: state.used ?? state.limit - state.remaining } as RateLimitState;
};

// Detects a rate limited response, either by HTTP status or by the `RATE_LIMITED` GraphQL error
// code. Returns the rate limit state reported in the error, if any.
const detectRateLimit = async (
  response: Response
): Promise<{ rateLimited: false } | { rateLimited: true; state: RateLimitState | null }> => {
  if (response.status === 429) return { rateLimited: true, state: null };

  // Avoid parsing the body when the headers already tell us there's budget left.
  const remaining = toNumber(response.headers.get(RATE_LIMIT_HEADERS.remaining));
  if (remaining !== undefined && remaining > 0) return { rateLimited: false };
  if (!response.headers.get('content-type')?.includes('json')) return { rateLimited: false };

  try {
    const body = (await response.clone().json()) as {
      errors?: { extensions?: { code?: unknown; rateLimit?: unknown } }[];
    };
    const error = body?.errors?.find((e) => e?.extensions?.code === RATE_LIMIT_ERROR_CODE);
    if (!error) return { rateLimited: false };
    return { rateLimited: true, state: parseRateLimitExtension(error.extensions?.rateLimit) };
  } catch {
    return { rateLimited: false };
  }
};

const parseRetryAfterMs = (headers: Headers) => {
  const seconds = toNumber(headers.get('retry-after'));
  return seconds === undefined ? undefined : seconds * 1000;
};

const msUntilReset = (state: RateLimitState | null) =>
  state ? Math.min(Math.max(state.resetAt * 1000 - Date.now(), 0), MAX_WAIT_MS) : 0;

const sleep = (ms: number, signal?: AbortSignal | null) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/**
 * Wraps `fetch` to respect the API's rate limit budget:
 * - Tracks the rate limit state reported through the `x-ratelimit-*` response headers.
 * - Holds back requests while the budget is exhausted, until the window resets.
 * - Retries requests that were rejected for being rate limited, once the window resets.
 *
 * Rate limit state is shared between all wrapped fetch functions, because the budget is per user.
 */
export const withRateLimit =
  (fetchFn: typeof fetch): typeof fetch =>
  async (input, init) => {
    for (let attempt = 0; ; attempt++) {
      const waitMs = Math.min(pausedUntil - Date.now(), MAX_WAIT_MS);
      if (waitMs > 0) await sleep(waitMs, init?.signal);

      const response = await fetchFn(input, init);
      const headerState = parseRateLimitHeaders(response.headers);
      if (headerState) {
        currentState = headerState;
        if (headerState.remaining <= 0) pausedUntil = Date.now() + msUntilReset(headerState);
      }

      const result = await detectRateLimit(response);
      if (!result.rateLimited) return response;

      if (result.state) currentState = { ...result.state, remaining: 0 };
      const retryAfterMs = parseRetryAfterMs(response.headers) ?? msUntilReset(currentState);
      pausedUntil = Date.now() + Math.min(Math.max(retryAfterMs, MIN_RETRY_WAIT_MS), MAX_WAIT_MS);

      if (attempt >= MAX_RETRIES) return response;
    }
  };

export const getRateLimitState = () => currentState;

export const __testUtils = {
  reset: () => {
    currentState = null;
    pausedUntil = 0;
  },
};
