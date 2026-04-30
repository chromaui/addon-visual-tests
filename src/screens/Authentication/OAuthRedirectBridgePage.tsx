import React, { useEffect, useMemo } from 'react';

type GrantPayload =
  | { message: 'grant'; code: string; state: string }
  | { message: 'grant'; error: string; error_description?: string; state?: string };

const getGrantPayload = (): GrantPayload => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (code && state) {
    return { message: 'grant', code, state };
  }

  if (error) {
    return {
      message: 'grant',
      error,
      ...(errorDescription ? { error_description: errorDescription } : {}),
      ...(state ? { state } : {}),
    };
  }

  return {
    message: 'grant',
    error: 'invalid_request',
    error_description: 'OAuth redirect is missing expected query parameters.',
    ...(state ? { state } : {}),
  };
};

export const OAuthRedirectBridgePage = () => {
  const payload = useMemo(getGrantPayload, []);

  useEffect(() => {
    if (!window.opener || window.opener.closed) {
      return;
    }

    window.opener.postMessage(payload, '*');
    window.close();
  }, [payload]);

  return <div>Completing authentication...</div>;
};
