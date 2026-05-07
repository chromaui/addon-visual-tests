import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../env', () => ({ CHROMATIC_BASE_URL: 'https://www.chromatic.com' }));
vi.mock('../constants', () => ({ OAUTH_CLIENT_ID: 'chromaui:addon-visual-tests' }));
vi.mock('./sha256', () => ({ sha256: (_: string) => 'aabbccdd' }));

// Stub window globals needed by requestAccessToken
vi.stubGlobal('window', {
  btoa: globalThis.btoa,
  crypto: globalThis.crypto,
  location: { href: 'https://storybook.example.com/iframe.html?args=&id=foo' },
});

const { initiateSignin, fetchAccessToken } = await import('./requestAccessToken');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('initiateSignin', () => {
  it('generates verifier/state as base64url strings (no +/= chars)', async () => {
    const { codeVerifier, state } = await initiateSignin();
    expect(codeVerifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(state).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('includes code_challenge_method=S256 in authorization URL', async () => {
    const { authorizationUrl } = await initiateSignin();
    expect(authorizationUrl).toContain('code_challenge_method=S256');
  });

  it('includes code_challenge in authorization URL', async () => {
    const { authorizationUrl } = await initiateSignin();
    expect(authorizationUrl).toContain('code_challenge=');
  });

  it('uses CHROMATIC_BASE_URL for token endpoint when no subdomain given', async () => {
    const { tokenEndpoint } = await initiateSignin();
    expect(tokenEndpoint).toBe('https://www.chromatic.com/token');
  });

  it('uses CHROMATIC_BASE_URL for authorization URL when no subdomain given', async () => {
    const { authorizationUrl } = await initiateSignin();
    expect(authorizationUrl).toContain('https://www.chromatic.com/authorize');
  });

  it('replaces www. with subdomain in token endpoint', async () => {
    const { tokenEndpoint } = await initiateSignin('acme');
    expect(tokenEndpoint).toBe('https://acme.chromatic.com/token');
  });

  it('replaces www. with subdomain in authorization URL', async () => {
    const { authorizationUrl } = await initiateSignin('acme');
    expect(authorizationUrl).toContain('https://acme.chromatic.com/authorize');
  });

  it('returns clientId matching OAUTH_CLIENT_ID', async () => {
    const { clientId } = await initiateSignin();
    expect(clientId).toBe('chromaui:addon-visual-tests');
  });

  it('strips query/hash from location.href for redirectUri', async () => {
    const { redirectUri } = await initiateSignin();
    expect(redirectUri).toBe('https://storybook.example.com/iframe.html');
  });
});

describe('fetchAccessToken', () => {
  const baseParams = {
    clientId: 'chromaui:addon-visual-tests',
    codeVerifier: 'verifier',
    redirectUri: 'https://example.com/redirect',
    tokenEndpoint: 'https://www.chromatic.com/token',
    sessionId: 'session-1',
    code: 'auth-code',
  };

  it('returns AuthSession on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ access_token: 'tok-abc', refresh_token: 'ref-xyz' }),
    } as Response);

    const auth = await fetchAccessToken(baseParams);
    expect(auth).toMatchObject({
      version: 2,
      accessToken: 'tok-abc',
      refreshToken: 'ref-xyz',
      sessionId: 'session-1',
    });
  });

  it('throws when refresh_token missing on success response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ access_token: 'tok-abc' }),
    } as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow('missing refresh token');
  });

  it('throws on authorization_pending error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ error: 'authorization_pending' }),
    } as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow(
      'You have not authorized the Visual Tests addon for Chromatic, please try again'
    );
  });

  it('prefers error_description over error in thrown message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ error: 'access_denied', error_description: 'User denied access' }),
    } as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow('User denied access');
  });

  it('throws with error code when error_description absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ error: 'server_error' }),
    } as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow('server_error');
  });

  it('throws fallback message when response has neither error nor access_token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({}),
    } as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow('Token exchange failed');
  });

  it('throws when response body is not JSON (e.g. 500 HTML)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    } as unknown as Response);

    await expect(fetchAccessToken(baseParams)).rejects.toThrow(SyntaxError);
  });

  it('POSTs to tokenEndpoint with correct Content-Type header', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ access_token: 'tok', refresh_token: 'ref' }),
    } as Response);

    await fetchAccessToken(baseParams);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.chromatic.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'X-Chromatic-Session-ID': 'session-1',
        }),
      })
    );
  });

  it('includes grant_type and code in request body', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ access_token: 'tok', refresh_token: 'ref' }),
    } as Response);

    await fetchAccessToken(baseParams);

    const body = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain('grant_type=authorization_code');
    expect(body).toContain('code=auth-code');
  });
});
