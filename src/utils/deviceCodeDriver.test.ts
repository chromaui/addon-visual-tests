import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../env', () => ({ CHROMATIC_BASE_URL: 'https://www.chromatic.com' }));
vi.mock('../constants', () => ({ OAUTH_CLIENT_ID: 'chromaui:addon-visual-tests' }));
vi.mock('./sha256', () => ({ sha256: (_: string) => 'aabbccdd' }));

const cryptoMock = {
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i += 1) arr[i] = (i * 7) & 0xff;
    return arr;
  }),
};

vi.stubGlobal('window', {
  btoa: globalThis.btoa,
  crypto: cryptoMock,
  open: vi.fn(() => ({ close: vi.fn() })),
});

const { createDeviceCodeDriver, BetaUserDeniedError } = await import('./deviceCodeDriver');

const makeAuthorizeResponse = (overrides: Partial<Record<string, unknown>> = {}) => ({
  device_code: 'device-code-123',
  user_code: 'ABCD-1234',
  verification_uri_complete: 'https://www.chromatic.com/device?user_code=ABCD-1234',
  expires_in: 600,
  interval: 5,
  ...overrides,
});

const jsonResponse = (data: unknown) => ({ json: async () => data }) as Response;

beforeEach(() => {
  cryptoMock.getRandomValues.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('deviceCodeDriver — start()', () => {
  it('uses crypto.getRandomValues for the PKCE verifier (not Math.random)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    const driver = createDeviceCodeDriver();
    await driver.start({});
    expect(cryptoMock.getRandomValues).toHaveBeenCalled();
    driver.cancel();
  });

  it('exposes affordance with userCode and verificationUrl', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    const driver = createDeviceCodeDriver();
    const result = await driver.start({});
    expect(result.affordance).toEqual({
      userCode: 'ABCD-1234',
      verificationUrl: 'https://www.chromatic.com/device?user_code=ABCD-1234',
    });
    driver.cancel();
  });

  it('rewrites verification URL to subdomain when subdomain provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    const driver = createDeviceCodeDriver();
    const result = await driver.start({ subdomain: 'acme' });
    expect(result.affordance?.verificationUrl).toContain('acme.chromatic.com');
    driver.cancel();
  });

  it('dispatches VERIFICATION_STARTED', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    const dispatch = vi.fn();
    const driver = createDeviceCodeDriver();
    await driver.start({ dispatch });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'VERIFICATION_STARTED',
      userCode: 'ABCD-1234',
      verificationUrl: 'https://www.chromatic.com/device?user_code=ABCD-1234',
    });
    driver.cancel();
  });

  it('emits a device-code snapshot via onSnapshot', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    const onSnapshot = vi.fn();
    const driver = createDeviceCodeDriver();
    await driver.start({ onSnapshot });
    expect(onSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        flow: 'device-code',
        deviceCode: 'device-code-123',
        userCode: 'ABCD-1234',
      })
    );
    driver.cancel();
  });

  it('reports flow=device-code', () => {
    const driver = createDeviceCodeDriver();
    expect(driver.flow).toBe('device-code');
  });
});

describe('deviceCodeDriver — polling and lifecycle', () => {
  it('continues polling on authorization_pending and resolves on access_token', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: 'authorization_pending' }));
    fetchSpy.mockResolvedValueOnce(jsonResponse({ access_token: 'tok-final' }));

    const driver = createDeviceCodeDriver();
    const { token } = await driver.start({});

    await vi.advanceTimersByTimeAsync(5000); // first poll → pending
    await vi.advanceTimersByTimeAsync(5000); // second poll → token
    await expect(token).resolves.toBe('tok-final');
  });

  it('throws BetaUserDeniedError when error_description is "Not OAuth beta user"', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ error: 'access_denied', error_description: 'Not OAuth beta user' })
    );

    const driver = createDeviceCodeDriver();
    const { token } = await driver.start({});
    await vi.advanceTimersByTimeAsync(5000);
    await expect(token).rejects.toBeInstanceOf(BetaUserDeniedError);
  });

  it('rejects with expiry message when expires has elapsed before next poll', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse({ expires_in: 1 })));

    const dispatch = vi.fn();
    const driver = createDeviceCodeDriver();
    const { token } = await driver.start({ dispatch });

    // Advance past the 1s expiry, then trigger poll (interval = 5s clamped).
    vi.setSystemTime(Date.now() + 2000);
    await vi.advanceTimersByTimeAsync(5000);

    await expect(token).rejects.toThrow(/expired/i);
    expect(dispatch).toHaveBeenCalledWith({ type: 'VERIFICATION_FAILED', reason: 'expired' });
  });

  it('clamps a NaN/zero interval to 1000ms', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse({ interval: Number.NaN })));
    fetchSpy.mockResolvedValueOnce(jsonResponse({ access_token: 'tok-after-nan' }));

    const driver = createDeviceCodeDriver();
    const { token } = await driver.start({});

    await vi.advanceTimersByTimeAsync(1000); // poll fires after clamped 1s
    await expect(token).resolves.toBe('tok-after-nan');
  });

  it('cancel() aborts in-flight fetch and clears pending poll timer', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse(makeAuthorizeResponse()));

    const dispatch = vi.fn();
    const driver = createDeviceCodeDriver();
    const { token } = await driver.start({ dispatch });

    driver.cancel();
    await expect(token).rejects.toThrow(/cancelled/i);
    expect(dispatch).toHaveBeenCalledWith({ type: 'VERIFICATION_FAILED', reason: 'cancelled' });

    // After cancel, advancing time must not trigger any further fetch calls.
    fetchSpy.mockClear();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('deviceCodeDriver — resume()', () => {
  it('continues polling from a stored snapshot without re-requesting /authorize', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(jsonResponse({ access_token: 'tok-resumed' }));

    const driver = createDeviceCodeDriver();
    const snapshot = {
      flow: 'device-code' as const,
      deviceCode: 'device-code-resumed',
      verifier: 'verifier-resumed',
      expires: Date.now() + 60_000,
      interval: 1000,
      userCode: 'WXYZ-9999',
      verificationUrl: 'https://www.chromatic.com/device?user_code=WXYZ-9999',
      tokenEndpoint: 'https://www.chromatic.com/token',
    };

    const { token } = await driver.resume!(snapshot, {});
    await vi.advanceTimersByTimeAsync(1000);
    await expect(token).resolves.toBe('tok-resumed');

    // Only one fetch call (the /token poll), no /authorize roundtrip.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect((fetchSpy.mock.calls[0]?.[0] as string) ?? '').toContain('/token');
  });
});
