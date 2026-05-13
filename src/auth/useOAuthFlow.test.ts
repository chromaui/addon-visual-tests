import { describe, expect, it } from 'vitest';

import { parseGrantPayload } from './useOAuthFlow';

describe('parseGrantPayload', () => {
  it('returns kind=login for login message', () => {
    expect(parseGrantPayload({ message: 'login' }, 'state')).toEqual({ kind: 'login' });
  });

  it('returns kind=ignore for non-grant message', () => {
    expect(
      parseGrantPayload({ message: 'createdProject', projectId: 'p1' } as any, 'state')
    ).toEqual({ kind: 'ignore' });
  });

  it('returns kind=error with error_description preferred over error', () => {
    const result = parseGrantPayload(
      {
        message: 'grant',
        error: 'access_denied',
        error_description: 'User denied access',
        state: 'state',
      },
      'state'
    );
    expect(result).toEqual({ kind: 'error', message: 'User denied access' });
  });

  it('returns kind=error with error when error_description is absent', () => {
    const result = parseGrantPayload(
      { message: 'grant', error: 'server_error', state: 'state' },
      'state'
    );
    expect(result).toEqual({ kind: 'error', message: 'server_error' });
  });

  it('returns kind=ignore for error payload missing state', () => {
    const result = parseGrantPayload({ message: 'grant', error: 'server_error' }, 'expected');
    expect(result).toEqual({ kind: 'ignore' });
  });

  it('returns kind=ignore for error payload with mismatched state', () => {
    const result = parseGrantPayload(
      { message: 'grant', error: 'server_error', state: 'wrong' },
      'expected'
    );
    expect(result).toEqual({ kind: 'ignore' });
  });

  it('returns kind=error with unexpected payload message when code is missing', () => {
    const result = parseGrantPayload({ message: 'grant', state: 'abc' } as any, 'abc');
    expect(result).toEqual({ kind: 'error', message: 'Unexpected OAuth callback payload' });
  });

  it('returns kind=error with unexpected payload message when state is missing', () => {
    const result = parseGrantPayload({ message: 'grant', code: 'xyz' } as any, 'abc');
    expect(result).toEqual({ kind: 'error', message: 'Unexpected OAuth callback payload' });
  });

  it('returns kind=error for state mismatch', () => {
    const result = parseGrantPayload({ message: 'grant', code: 'xyz', state: 'wrong' }, 'expected');
    expect(result).toEqual({ kind: 'error', message: 'Invalid OAuth state' });
  });

  it('returns kind=code with code value on valid grant', () => {
    const result = parseGrantPayload({ message: 'grant', code: 'auth-code', state: 'abc' }, 'abc');
    expect(result).toEqual({ kind: 'code', code: 'auth-code' });
  });
});
