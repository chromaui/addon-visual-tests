import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initiateSignin } from './requestAccessToken';

describe('requestAccessToken', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      btoa: (value: string) => Buffer.from(value, 'binary').toString('base64'),
    });
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses the SSO subdomain for the authorize request and verification URL', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        device_code: 'device-code',
        user_code: '123 123',
        verification_uri_complete:
          'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123',
        expires_in: 300,
        interval: 5,
      }),
    });

    const result = await initiateSignin('rocket');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://rocket.chromatic.com/authorize',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.verificationUrl).toBe(
      'https://rocket.chromatic.com/connect/chromaui:addon-visual-tests?code=123123'
    );
  });

  it('keeps the default host when no SSO subdomain is provided', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        device_code: 'device-code',
        user_code: '123 123',
        verification_uri_complete:
          'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123',
        expires_in: 300,
        interval: 5,
      }),
    });

    const result = await initiateSignin();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.chromatic.com/authorize',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.verificationUrl).toBe(
      'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123'
    );
  });
});
