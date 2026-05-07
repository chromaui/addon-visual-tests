import { useCallback, useRef } from 'react';

import { exchangeOAuthCode, parseGrantPayload } from './oauthGrant';
import type { AuthSession, TokenExchangeParameters } from './requestAccessToken';
import { type DialogHandler, useChromaticDialog } from './useChromaticDialog';

type DialogPayload = Parameters<DialogHandler>[0];

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
