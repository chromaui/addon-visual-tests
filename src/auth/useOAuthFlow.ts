import { useCallback, useRef } from 'react';

import {
  type AuthSession,
  fetchAccessToken,
  type TokenExchangeParameters,
} from './requestAccessToken';
import { type DialogHandler, useChromaticDialog } from './useChromaticDialog';

type DialogPayload = Parameters<DialogHandler>[0];

export type GrantOutcome =
  | { kind: 'login' }
  | { kind: 'error'; message: string }
  | { kind: 'ignore' }
  | { kind: 'code'; code: string };

export const exchangeOAuthCode = (
  params: Pick<TokenExchangeParameters, 'codeVerifier' | 'redirectUri' | 'sessionId' | 'subdomain'>,
  code: string
): Promise<AuthSession> => fetchAccessToken({ ...params, code });

export const parseGrantPayload = (event: DialogPayload, expectedState: string): GrantOutcome => {
  if (event.message === 'login') return { kind: 'login' };
  if (event.message !== 'grant') return { kind: 'ignore' };

  if ('error' in event) {
    if (!('state' in event) || event.state !== expectedState) return { kind: 'ignore' };
    return { kind: 'error', message: event.error_description || event.error };
  }
  if (!('code' in event) || !('state' in event)) {
    return { kind: 'error', message: 'Unexpected OAuth callback payload' };
  }
  if (event.state !== expectedState) {
    return { kind: 'error', message: 'Invalid OAuth state' };
  }
  return { kind: 'code', code: event.code };
};

export type OAuthFlowContext = {
  closeDialog: () => void;
  openDialog: (url: string, additionalOrigins?: string[]) => void;
};

export type OAuthFlowOptions = {
  onAuthenticated: (session: AuthSession, ctx: OAuthFlowContext) => void | Promise<void>;
  onError: (error: unknown) => void;
  onMessage?: (event: DialogPayload, ctx: OAuthFlowContext) => void;
};

export function useOAuthFlow({ onAuthenticated, onError, onMessage }: OAuthFlowOptions) {
  const paramsRef = useRef<TokenExchangeParameters | null>(null);
  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
  const closeDialogRef = useRef<() => void>();

  const handler = useCallback<DialogHandler>(
    async (event) => {
      const ctx: OAuthFlowContext = {
        closeDialog: () => closeDialogRef.current?.(),
        openDialog: (url, origins) => openDialogRef.current?.(url, origins),
      };

      const params = paramsRef.current;
      if (params) {
        const outcome = parseGrantPayload(event, params.state);
        if (outcome.kind === 'login') return;
        if (outcome.kind === 'error') {
          paramsRef.current = null;
          ctx.closeDialog();
          onError(new Error(outcome.message));
          return;
        }
        if (outcome.kind === 'code') {
          paramsRef.current = null;
          try {
            const session = await exchangeOAuthCode(
              {
                codeVerifier: params.codeVerifier,
                redirectUri: params.redirectUri,
                sessionId: params.sessionId,
                subdomain: params.subdomain,
              },
              outcome.code
            );
            await onAuthenticated(session, ctx);
          } catch (error) {
            ctx.closeDialog();
            onError(error);
          }
          return;
        }
      }

      onMessage?.(event, ctx);
    },
    [onAuthenticated, onError, onMessage]
  );

  const [openDialog, closeDialog] = useChromaticDialog(handler);
  openDialogRef.current = openDialog;
  closeDialogRef.current = closeDialog;

  const begin = useCallback((params: TokenExchangeParameters) => {
    paramsRef.current = params;
    const redirectOrigin = new URL(params.redirectUri).origin;
    openDialogRef.current?.(params.authorizationUrl, [redirectOrigin]);
  }, []);

  return { begin, openDialog, closeDialog };
}
