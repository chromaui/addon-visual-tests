# codex advisor artifact

- Provider: codex
- Exit code: 0
- Created at: 2026-05-07T14:01:10.122Z

## Original task

Review PR #425 in chromaui/addon-visual-tests "Add refresh-token auth flow and harden HTML injection paths". Branch: refresh-token. Focus on correctness, architecture, security, race conditions, and SIMPLIFICATION opportunities. Identify dead code, redundant abstractions, over-engineering. Keep terse, list concrete simplifications with file:line where possible.

Key files:
- src/utils/graphQLClient.tsx (+227/-38) - reactive refresh, single-flight, retry
- src/utils/graphQLClient.test.ts (+169) new
- src/utils/requestAccessToken.ts (+113/-10) - auth blob storage
- eslint.config.mjs (+47) - HTML injection bans
- src/Panel.tsx (+33/-3)
- src/screens/Authentication/Verify.tsx (+31/-14)
- src/utils/oauthGrant.ts (+7/-3)

Diff at /tmp/pr425.diff. Read it. Then output:
1. Bugs/risks (severity)
2. Simplifications (concrete, file:line, what to drop)
3. Architecture concerns
Max 400 words.

## Final prompt

Review PR #425 in chromaui/addon-visual-tests "Add refresh-token auth flow and harden HTML injection paths". Branch: refresh-token. Focus on correctness, architecture, security, race conditions, and SIMPLIFICATION opportunities. Identify dead code, redundant abstractions, over-engineering. Keep terse, list concrete simplifications with file:line where possible.

Key files:
- src/utils/graphQLClient.tsx (+227/-38) - reactive refresh, single-flight, retry
- src/utils/graphQLClient.test.ts (+169) new
- src/utils/requestAccessToken.ts (+113/-10) - auth blob storage
- eslint.config.mjs (+47) - HTML injection bans
- src/Panel.tsx (+33/-3)
- src/screens/Authentication/Verify.tsx (+31/-14)
- src/utils/oauthGrant.ts (+7/-3)

Diff at /tmp/pr425.diff. Read it. Then output:
1. Bugs/risks (severity)
2. Simplifications (concrete, file:line, what to drop)
3. Architecture concerns
Max 400 words.

## Raw output

```text
1. Bugs/risks

- **Medium** [src/screens/Authentication/Verify.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/screens/Authentication/Verify.tsx:91): `getFetchOptions(token.accessToken)` runs before `setAuthenticatedSession(token)`, so [graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:170) sends the fallback session id, not the OAuth `sessionId`. If Chromatic correlates token/session headers, the initial project query can fail or be misattributed.
- **Medium** [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:227): retrying `refresh_token` after `AbortError`/5xx can be unsafe with rotating refresh tokens. If the first request reached the server and rotated the token but the response was lost, the retry may reuse an invalidated token and kill the session.
- **Low** [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:90): legacy raw JWT storage is deleted with no migration. Existing users will be forced to re-auth after upgrade. Maybe acceptable, but should be explicit.
- **Low** [eslint.config.mjs](/Users/valentinpalkovic/Projects/addon-visual-tests/eslint.config.mjs:82): HTML-sink bans miss computed/template forms like `el['innerHTML'] = x` and `setTimeout(\`${x}\`)`. Good guardrail, not a complete hardening boundary.

2. Simplifications

- [src/screens/Authentication/Verify.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/screens/Authentication/Verify.tsx:60): drop `accessToken` ref. `authSession.current?.accessToken` is the same state; two refs create impossible states and extra error branches.
- [src/utils/requestAccessToken.ts](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/requestAccessToken.ts:9): drop `clientId` from `TokenExchangeParameters`; it is always `OAUTH_CLIENT_ID`.
- [src/utils/requestAccessToken.ts](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/requestAccessToken.ts:16): consider dropping persisted `tokenEndpoint`; derive it from validated `subdomain` for both exchange and refresh.
- [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:81): remove the “token before full auth state” branch if all real sign-in paths now call `setAuthenticatedSession` first.
- [src/Panel.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/Panel.tsx:49): `PanelProps.api` and the `API` import are now dead; remove them.

3. Architecture concerns

Auth state is now spread across module globals, `localStorage`, Storybook addon state, token subscribers, storage events, and a custom window event. That is a lot of coordination for one session object. A small auth-store abstraction with `get/set/clear/subscribe/refresh` would make races and tests easier to reason about.

Storing refresh tokens in `localStorage` increases XSS blast radius. The lint bans help, but they do not make browser storage a secure token boundary.


Reading additional input from stdin...
OpenAI Codex v0.125.0 (research preview)
--------
workdir: /Users/valentinpalkovic/Projects/addon-visual-tests
model: gpt-5.5
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: high
reasoning summaries: none
session id: 019e02ba-6cd2-7cc0-bc29-fe39192c1535
--------
user
Review PR #425 in chromaui/addon-visual-tests "Add refresh-token auth flow and harden HTML injection paths". Branch: refresh-token. Focus on correctness, architecture, security, race conditions, and SIMPLIFICATION opportunities. Identify dead code, redundant abstractions, over-engineering. Keep terse, list concrete simplifications with file:line where possible.

Key files:
- src/utils/graphQLClient.tsx (+227/-38) - reactive refresh, single-flight, retry
- src/utils/graphQLClient.test.ts (+169) new
- src/utils/requestAccessToken.ts (+113/-10) - auth blob storage
- eslint.config.mjs (+47) - HTML injection bans
- src/Panel.tsx (+33/-3)
- src/screens/Authentication/Verify.tsx (+31/-14)
- src/utils/oauthGrant.ts (+7/-3)

Diff at /tmp/pr425.diff. Read it. Then output:
1. Bugs/risks (severity)
2. Simplifications (concrete, file:line, what to drop)
3. Architecture concerns
Max 400 words.
ERROR: Reconnecting... 2/5
ERROR: Reconnecting... 3/5
ERROR: Reconnecting... 4/5
ERROR: Reconnecting... 5/5
codex
I’ll review the provided diff directly and ground findings in changed lines. I’ll keep the output in a code-review format with concrete line references where the diff gives enough context.
exec
/bin/zsh -lc "sed -n '1,260p' /tmp/pr425.diff" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:

eslint.config.mjs
  @@ -71,6 +71,53 @@ export default [
  +
  +      // Ban common DOM/JS sinks used for runtime code/HTML injection.
  +      'no-restricted-syntax': [
  +        'error',
  +        {
  +          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
  +          message: 'dangerouslySetInnerHTML is banned',
  +        },
  +        {
  +          selector: "AssignmentExpression[left.property.name='innerHTML']",
  +          message: 'innerHTML assignment is banned',
  +        },
  +        {
  +          selector: "AssignmentExpression[left.property.name='outerHTML']",
  +          message: 'outerHTML assignment is banned',
  +        },
  +        {
  +          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
  +          message: 'insertAdjacentHTML is banned',
  +        },
  +        {
  +          selector:
  +            "CallExpression[callee.object.name='document'][callee.property.name=/^writeln?$/]",
  +          message: 'document.write/writeln is banned',
  +        },
  +        {
  +          selector: "JSXAttribute[name.name='srcdoc']",
  +          message: 'iframe srcdoc is banned',
  +        },
  +        {
  +          selector: "CallExpression[callee.property.name='createContextualFragment']",
  +          message: 'createContextualFragment is banned',
  +        },
  +        {
  +          selector:
  +            "CallExpression[callee.name=/^(setTimeout|setInterval)$/][arguments.0.type='Literal']",
  +          message: 'String-form setTimeout/setInterval is banned',
  +        },
  +        {
  +          selector: "CallExpression[callee.name='eval']",
  +          message: 'eval is banned',
  +        },
  +        {
  +          selector: "NewExpression[callee.name='Function']",
  +          message: 'Function constructor is banned',
  +        },
  +      ],
       },
     },
   ];
  +47 -0

src/Panel.tsx
  @@ -1,6 +1,13 @@
  -import React, { useCallback } from 'react';
  +import { FailedIcon } from '@storybook/icons';
  +import React, { useCallback, useEffect } from 'react';
   import type { API } from 'storybook/manager-api';
  -import { experimental_getStatusStore, useChannel, useStorybookState } from 'storybook/manager-api';
  +import {
  +  experimental_getStatusStore,
  +  useChannel,
  +  useStorybookApi,
  +  useStorybookState,
  +} from 'storybook/manager-api';
  +import { color } from 'storybook/theming';
   
   import { AuthProvider } from './AuthContext';
   import { Spinner } from './components/design-system';
  @@ -26,7 +33,12 @@ import { ControlsProvider } from './screens/VisualTests/ControlsContext';
  -import { createClient, GraphQLClientProvider, useAccessToken } from './utils/graphQLClient';
  +import {
  +  createClient,
  +  GraphQLClientProvider,
  +  sessionExpiredEventName,
  +  useAccessToken,
  +} from './utils/graphQLClient';
   import { TelemetryProvider } from './utils/TelemetryContext';
   import { useBuildEvents } from './utils/useBuildEvents';
   import { useChannelFetch } from './utils/useChannelFetch';
  @@ -42,6 +54,7 @@ interface PanelProps {
  +  const api = useStorybookApi();
     const [accessToken, updateAccessToken] = useAccessToken();
     const setAccessToken = useCallback(
       (token: string | null) => {
  @@ -58,6 +71,23 @@ export const Panel = ({ active }: PanelProps) => {
  +  useEffect(() => {
  +    const notify = () => {
  +      api.addNotification({
  +        id: `${ADDON_ID}/error/session-expired/${Date.now()}`,
  +        content: {
  +          headline: 'Session expired',
  +          subHeadline: 'Please sign in again to continue.',
  +        },
  +        icon: <FailedIcon color={color.negative} />,
  +      });
  +    };
  +
  +    window.addEventListener(sessionExpiredEventName, notify);
  +    return () => {
  +      window.removeEventListener(sessionExpiredEventName, notify);
  +    };
  +  }, [api]);
   
     const updateBuildStatus = useCallback<UpdateStatusFunction>((statuses) => {
       statusStore.unset();
  +33 -3

src/screens/Authentication/Verify.tsx
  @@ -9,9 +9,9 @@ import { Stack } from '../../components/Stack';
  -import { getFetchOptions } from '../../utils/graphQLClient';
  +import { getFetchOptions, setAuthenticatedSession } from '../../utils/graphQLClient';
   import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
  -import type { TokenExchangeParameters } from '../../utils/requestAccessToken';
  +import type { AuthStorage, TokenExchangeParameters } from '../../utils/requestAccessToken';
   import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
   import { useErrorNotification } from '../../utils/useErrorNotification';
   import { AuthHeader } from './AuthHeader';
  @@ -45,22 +45,32 @@ export const Verify = ({
  -  const { authorizationUrl, state, clientId, codeVerifier, redirectUri, tokenEndpoint } =
  -    exchangeParameters;
  +  const {
  +    authorizationUrl,
  +    state,
  +    clientId,
  +    codeVerifier,
  +    redirectUri,
  +    sessionId,
  +    tokenEndpoint,
  +    subdomain,
  +  } = exchangeParameters;
     const redirectOrigin = new URL(redirectUri).origin;
   
  -  // Store the access token until we are ready to pass it to `setAccessToken` (at which point
  -  // the Panel will close the Authentication screen)
  +  // Store auth details until we're ready to finish the login flow and persist them in addon state.
  +  const authSession = useRef<AuthStorage>();
  +  // Store just the access token for existing callback paths that only need bearer auth.
     const accessToken = useRef<string>();
   
     const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
     const closeDialogRef = useRef<() => void>();
     const handler = useCallback<DialogHandler>(
       async (event) => {
  -      // If the user logs in as part of the grant process, don't close the dialog,
  -      // instead redirect us back to where we were trying to go.
  +      // Ignore login relay events here. Re-opening the popup from a postMessage
  +      // handler can replace the tracked window (or be popup-blocked), causing
  +      // the eventual grant callback from the original popup to be ignored.
         if (event.message === 'login') {
  -        openDialogRef.current?.(authorizationUrl, [redirectOrigin]);
  +        return;
         }
   
         if (event.message === 'grant') {
  @@ -71,13 +81,14 @@ export const Verify = ({
  -            { clientId, codeVerifier, redirectUri, tokenEndpoint },
  +            { clientId, codeVerifier, redirectUri, sessionId, tokenEndpoint, subdomain },
               outcome.code
             );
  -          accessToken.current = token;
  +          authSession.current = token;
  +          accessToken.current = token.accessToken;
   
             // Override token for this query but don't store it yet until they've created a project
  -          const fetchOptions = getFetchOptions(token);
  +          const fetchOptions = getFetchOptions(token.accessToken);
             const { data } = await client.query(ProjectCountQuery, {}, { fetchOptions });
   
             if (!data?.viewer) throw new Error('Failed to fetch initial project list');
  @@ -85,6 +96,7 @@ export const Verify = ({
  +            setAuthenticatedSession(token);
               setAccessToken(accessToken.current);
               closeDialogRef.current?.();
             } else {
  @@ -105,6 +117,11 @@ export const Verify = ({
  +          if (!authSession.current) {
  +            onError('Unexpected missing auth session', new Error());
  +            return;
  +          }
  +          setAuthenticatedSession(authSession.current);
             setAccessToken(accessToken.current);
             setCreatedProjectId(`Project:${event.projectId}`);
             closeDialogRef.current?.();
  @@ -112,13 +129,13 @@ export const Verify = ({
  -      authorizationUrl,
  -      redirectOrigin,
         state,
         clientId,
         codeVerifier,
         redirectUri,
  +      sessionId,
         tokenEndpoint,
  +      subdomain,
         client,
         hasProjectId,
         setAccessToken,
  +31 -14

src/screens/GuidedTour/PulsatingEffect.tsx
  @@ -24,7 +24,7 @@ export function PulsatingEffect({ targetSelector }: { targetSelector: string }):
  -      style.innerHTML = keyframes;
  +      style.textContent = keyframes;
         document.head.appendChild(style);
       }
   
  +1 -1

src/screens/ShareSection/useShareAuth.test.ts
  @@ -7,9 +7,17 @@ const mocks = vi.hoisted(() => {
  +  const setAuthenticatedSession = vi.fn();
     const exchangeOAuthCode = vi.fn();
     const initiateSignin = vi.fn();
  -  return { openDialog, closeDialog, updateToken, exchangeOAuthCode, initiateSignin };
  +  return {
  +    openDialog,
  +    closeDialog,
  +    updateToken,
  +    setAuthenticatedSession,
  +    exchangeOAuthCode,
  +    initiateSignin,
  +  };
   });
   
   vi.mock('react', async (importOriginal) => {
  @@ -23,6 +31,7 @@ vi.mock('react', async (importOriginal) => {
  +  setAuthenticatedSession: mocks.setAuthenticatedSession,
   }));
   
   vi.mock('../../utils/oauthGrant', async (importOriginal) => {
  @@ -50,10 +59,18 @@ const defaultParams = {
  +  sessionId: 'session-id',
     authorizationUrl: 'https://chromatic.com/authorize',
     tokenEndpoint: 'https://chromatic.com/token',
   };
   
  +const createAuthStorage = (accessToken = 'access-token-xyz') => ({
  +  version: 2 as const,
  +  accessToken,
  +  refreshToken: 'refresh-token',
  +  sessionId: 'session-id',
  +});
  +
   afterEach(() => {
     vi.clearAllMocks();
     capturedHandler = undefined;
  @@ -62,8 +79,9 @@ afterEach(() => {
  +    const auth = createAuthStorage();
       mocks.initiateSignin.mockResolvedValueOnce(defaultParams);
  -    mocks.exchangeOAuthCode.mockResolvedValueOnce('access-token-xyz');
  +    mocks.exchangeOAuthCode.mockResolvedValueOnce(auth);
   
       const { startSignIn } = useShareAuth(setShareState);
       await (startSignIn as () => Promise<void>)();
  @@ -75,6 +93,7 @@ describe('useShareAuth', () => {
  +    expect(mocks.setAuthenticatedSession).toHaveBeenCalledWith(auth);
       expect(mocks.updateToken).toHaveBeenCalledWith('access-token-xyz');

exec
/bin/zsh -lc "sed -n '261,620p' /tmp/pr425.diff" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
       expect(setShareState).toHaveBeenCalledWith({ status: 'uploading', shareUrl: '' });
     });
  @@ -83,7 +102,7 @@ describe('useShareAuth', () => {
  -    let resolveFetch!: (token: string) => void;
  +    let resolveFetch!: (token: ReturnType<typeof createAuthStorage>) => void;
       mocks.exchangeOAuthCode.mockReturnValueOnce(
         new Promise((resolve) => {
           resolveFetch = resolve;
  @@ -98,7 +117,7 @@ describe('useShareAuth', () => {
  -    resolveFetch('token');
  +    resolveFetch(createAuthStorage());
       await first;
   
       expect(mocks.exchangeOAuthCode).toHaveBeenCalledOnce();
  @@ -120,7 +139,7 @@ describe('useShareAuth', () => {
  -    mocks.exchangeOAuthCode.mockResolvedValueOnce('token');
  +    mocks.exchangeOAuthCode.mockResolvedValueOnce(createAuthStorage('token'));
   
       const { startSignIn } = useShareAuth(setShareState);
       await (startSignIn as () => Promise<void>)();
  +24 -5

src/screens/ShareSection/useShareAuth.ts
  @@ -1,6 +1,6 @@
  -import { useAccessToken } from '../../utils/graphQLClient';
  +import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
   import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
   import { initiateSignin, type TokenExchangeParameters } from '../../utils/requestAccessToken';
   import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
  @@ -17,7 +17,8 @@ export function useShareAuth(setShareState: (s: ShareState) => void) {
  -      const { redirectUri, state, clientId, codeVerifier, tokenEndpoint } = params;
  +      const { redirectUri, state, clientId, codeVerifier, tokenEndpoint, sessionId, subdomain } =
  +        params;
         const outcome = parseGrantPayload(event, state);
   
         if (outcome.kind === 'login' || outcome.kind === 'ignore') {
  @@ -35,11 +36,12 @@ export function useShareAuth(setShareState: (s: ShareState) => void) {
  -          { clientId, codeVerifier, redirectUri, tokenEndpoint },
  +          { clientId, codeVerifier, redirectUri, tokenEndpoint, sessionId, subdomain },
             outcome.code
           );
   
  -        updateToken(token);
  +        setAuthenticatedSession(token);
  +        updateToken(token.accessToken);
           closeDialogRef.current?.();
           setShareState({ status: 'uploading', shareUrl: '' });
         } catch {
  +6 -4

src/utils/graphQLClient.test.ts
  @@ -0,0 +1,169 @@
  +import { beforeEach, describe, expect, it, vi } from 'vitest';
  +
  +import { ACCESS_TOKEN_KEY } from '../env';
  +import { __testUtils, setAuthenticatedSession } from './graphQLClient';
  +import type { AuthStorage } from './requestAccessToken';
  +
  +const createAuth = (overrides: Partial<AuthStorage> = {}): AuthStorage => ({
  +  version: 2,
  +  accessToken: 'access-token-1',
  +  refreshToken: 'refresh-token-1',
  +  sessionId: 'session-id-1',
  +  ...overrides,
  +});
  +
  +const ensureLocalStorage = () => {
  +  if (globalThis.localStorage) {
  +    return;
  +  }
  +  let store: Record<string, string> = {};
  +  Object.defineProperty(globalThis, 'localStorage', {
  +    configurable: true,
  +    value: {
  +      getItem: (key: string) => store[key] ?? null,
  +      setItem: (key: string, value: string) => {
  +        store[key] = String(value);
  +      },
  +      removeItem: (key: string) => {
  +        delete store[key];
  +      },
  +      clear: () => {
  +        store = {};
  +      },
  +      key: (index: number) => Object.keys(store)[index] ?? null,
  +      get length() {
  +        return Object.keys(store).length;
  +      },
  +    } satisfies Storage,
  +  });
  +};
  +
  +describe('graphQLClient refresh auth', () => {
  +  beforeEach(() => {
  +    ensureLocalStorage();
  +    localStorage.clear();
  +    vi.restoreAllMocks();
  +  });
  +
  +  it('updates access and refresh tokens after successful refresh', async () => {
  +    setAuthenticatedSession(createAuth());
  +    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
  +      new Response(
  +        JSON.stringify({
  +          access_token: 'access-token-2',
  +          refresh_token: 'refresh-token-2',
  +        }),
  +        { status: 200 }
  +      )
  +    );
  +
  +    await __testUtils.refreshCurrentSession();
  +
  +    expect(__testUtils.getCurrentAuth()).toMatchObject({
  +      accessToken: 'access-token-2',
  +      refreshToken: 'refresh-token-2',
  +      sessionId: 'session-id-1',
  +    });
  +
  +    expect(JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY) || '{}')).toMatchObject({
  +      accessToken: 'access-token-2',
  +      refreshToken: 'refresh-token-2',
  +      sessionId: 'session-id-1',
  +    });
  +  });
  +
  +  it('notifies token subscribers when refresh updates token', async () => {
  +    setAuthenticatedSession(createAuth());
  +    const subscriber = vi.fn();
  +    const unsubscribe = __testUtils.subscribeToTokenUpdates(subscriber);
  +    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
  +      new Response(
  +        JSON.stringify({
  +          access_token: 'access-token-2',
  +          refresh_token: 'refresh-token-2',
  +        }),
  +        { status: 200 }
  +      )
  +    );
  +
  +    await __testUtils.refreshCurrentSession();
  +    unsubscribe();
  +
  +    expect(subscriber).toHaveBeenLastCalledWith('access-token-2');
  +  });
  +
  +  it('clears auth state and rejects when refresh fails with terminal error', async () => {
  +    setAuthenticatedSession(createAuth());
  +    vi.spyOn(console, 'warn').mockImplementation(() => {});
  +    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 401 }));
  +
  +    await expect(__testUtils.refreshCurrentSession()).rejects.toThrow('Token refresh failed (401)');
  ... (69 lines truncated)
  +169 -0

src/utils/graphQLClient.tsx
  @@ -1,31 +1,148 @@
  -import { Client, ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
  +import { Client, type ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
   import { v4 as uuid } from 'uuid';
   
  -import { ADDON_ID } from '../constants';
  +import { ADDON_ID, OAUTH_CLIENT_ID } from '../constants';
   import { ACCESS_TOKEN_KEY, CHROMATIC_API_URL } from '../env';
  +import { type AuthStorage, AuthStorageSchema, refreshAccessToken } from './requestAccessToken';
  +
  +const REFRESH_TIMEOUT_MS = 10_000;
  +const getStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);
  +const SESSION_EXPIRED_EVENT = `${ADDON_ID}/session-expired`;
  +const setBrowserTimeout = (...args: Parameters<typeof globalThis.setTimeout>) =>
  +  (typeof window !== 'undefined' ? window : globalThis).setTimeout(...args);
  +const clearBrowserTimeout = (...args: Parameters<typeof globalThis.clearTimeout>) =>
  +  (typeof window !== 'undefined' ? window : globalThis).clearTimeout(...args);
  +
  +let currentAuth: AuthStorage | null = null;
  +let currentToken: string | null = null;
  +let refreshPromise: Promise<void> | null = null;
  +let refreshAbortController: AbortController | null = null;
  +let authGeneration = 0;
  +const tokenSubscribers = new Set<(token: string | null) => void>();
  +const fallbackSessionId = uuid();
  +
  +const notifyTokenSubscribers = () => {
  +  tokenSubscribers.forEach((subscriber) => {
  +    subscriber(currentToken);
  +  });
  +};
  +
  +const subscribeToTokenUpdates = (subscriber: (token: string | null) => void) => {
  +  tokenSubscribers.add(subscriber);
  +  return () => {
  +    tokenSubscribers.delete(subscriber);
  +  };
  +};
  +
  +const notifySessionExpired = () => {
  +  if (typeof window === 'undefined') {
  +    return;
  +  }
  +  window.dispatchEvent(new window.CustomEvent(SESSION_EXPIRED_EVENT));
  +};
  +
  +const persistCurrentAuth = () => {
  +  const storage = getStorage();
  +  if (!storage) {
  +    return;
  +  }
  +  if (currentAuth) {
  +    storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(currentAuth));
  +  } else {
  +    storage.removeItem(ACCESS_TOKEN_KEY);
  +  }
  +};
  +
  +const setCurrentAuth = (auth: AuthStorage | null) => {
  +  currentAuth = auth;
  +  currentToken = auth?.accessToken ?? null;
  +
  +  persistCurrentAuth();
  +  notifyTokenSubscribers();
  +};
  +
  +const clearCurrentAuth = () => {
  +  authGeneration += 1;
  +  refreshAbortController?.abort();
  +  refreshAbortController = null;
  +  refreshPromise = null;
  +  setCurrentAuth(null);
  +};
   
  -let currentToken: string | null;
  -let currentTokenExpiration: number | null;
   const setCurrentToken = (token: string | null) => {
  -  try {
  -    const { exp } = token ? JSON.parse(atob(token.split('.')[1])) : { exp: null };
  -    currentToken = token;
  -    currentTokenExpiration = exp;
  -  } catch (_) {
  -    currentToken = null;
  -    currentTokenExpiration = null;
  +  if (!token) {
  +    clearCurrentAuth();
  +    return;
     }
  -  if (currentToken) {
  -    localStorage.setItem(ACCESS_TOKEN_KEY, currentToken);
  +
  +  if (currentAuth) {

... (more changes truncated)
  +72 -13
[full diff: rtk git diff --no-compact]

exec
/bin/zsh -lc "sed -n '621,980p' /tmp/pr425.diff" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
codex
The compact diff hides part of the largest file, so I’m switching to the working tree with line numbers for the changed modules. That will make the review references usable instead of pointing at truncated diff hunks.
exec
/bin/zsh -lc "nl -ba src/utils/graphQLClient.tsx | sed -n '1,260p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
exec
/bin/zsh -lc "nl -ba src/screens/Authentication/Verify.tsx | sed -n '1,220p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
exec
/bin/zsh -lc "nl -ba src/Panel.tsx | sed -n '1,160p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
exec
/bin/zsh -lc "nl -ba src/utils/requestAccessToken.ts | sed -n '1,260p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
     1	import React, { useCallback, useRef } from 'react';
     2	import { useClient } from 'urql';
     3	
     4	import { Button } from '../../components/Button';
     5	import { Container } from '../../components/Container';
     6	import { Heading } from '../../components/Heading';
     7	import { Screen } from '../../components/Screen';
     8	import { Stack } from '../../components/Stack';
     9	import { Text } from '../../components/Text';
    10	import { graphql } from '../../gql';
    11	import type { Project } from '../../gql/graphql';
    12	import { getFetchOptions, setAuthenticatedSession } from '../../utils/graphQLClient';
    13	import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
    14	import type { AuthStorage, TokenExchangeParameters } from '../../utils/requestAccessToken';
    15	import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
    16	import { useErrorNotification } from '../../utils/useErrorNotification';
    17	import { AuthHeader } from './AuthHeader';
    18	
    19	const ProjectCountQuery = graphql(/* GraphQL */ `
    20	  query VisualTestsProjectCountQuery {
    21	    viewer {
    22	      projectCount
    23	      accounts {
    24	        newProjectUrl
    25	      }
    26	    }
    27	  }
    28	`);
    29	
    30	interface VerifyProps {
    31	  onBack: () => void;
    32	  hasProjectId: boolean;
    33	  setAccessToken: (token: string) => void;
    34	  setCreatedProjectId: (projectId: Project['id']) => void;
    35	  exchangeParameters: TokenExchangeParameters;
    36	}
    37	
    38	export const Verify = ({
    39	  onBack,
    40	  hasProjectId,
    41	  setAccessToken,
    42	  setCreatedProjectId,
    43	  exchangeParameters,
    44	}: VerifyProps) => {
    45	  const client = useClient();
    46	  const onError = useErrorNotification();
    47	
    48	  const {
    49	    authorizationUrl,
    50	    state,
    51	    clientId,
    52	    codeVerifier,
    53	    redirectUri,
    54	    sessionId,
    55	    tokenEndpoint,
    56	    subdomain,
    57	  } = exchangeParameters;
    58	  const redirectOrigin = new URL(redirectUri).origin;
    59	
    60	  // Store auth details until we're ready to finish the login flow and persist them in addon state.
    61	  const authSession = useRef<AuthStorage>();
    62	  // Store just the access token for existing callback paths that only need bearer auth.
    63	  const accessToken = useRef<string>();
    64	
    65	  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
    66	  const closeDialogRef = useRef<() => void>();
    67	  const handler = useCallback<DialogHandler>(
    68	    async (event) => {
    69	      // Ignore login relay events here. Re-opening the popup from a postMessage
    70	      // handler can replace the tracked window (or be popup-blocked), causing
    71	      // the eventual grant callback from the original popup to be ignored.
    72	      if (event.message === 'login') {
    73	        return;
    74	      }
    75	
    76	      if (event.message === 'grant') {
    77	        try {
    78	          const outcome = parseGrantPayload(event, state);
    79	          if (outcome.kind === 'ignore') return;
    80	          if (outcome.kind === 'error') throw new Error(outcome.message);
    81	          if (outcome.kind === 'login') return;
    82	
    83	          const token = await exchangeOAuthCode(
    84	            { clientId, codeVerifier, redirectUri, sessionId, tokenEndpoint, subdomain },
    85	            outcome.code
    86	          );
    87	          authSession.current = token;
    88	          accessToken.current = token.accessToken;
    89	
    90	          // Override token for this query but don't store it yet until they've created a project
    91	          const fetchOptions = getFetchOptions(token.accessToken);
    92	          const { data } = await client.query(ProjectCountQuery, {}, { fetchOptions });
    93	
    94	          if (!data?.viewer) throw new Error('Failed to fetch initial project list');
    95	
    96	          // The user has projects to choose from (or the project is already selected),
    97	          // so send them to pick one
    98	          if (data.viewer.projectCount > 0 || hasProjectId) {
    99	            setAuthenticatedSession(token);
   100	            setAccessToken(accessToken.current);
   101	            closeDialogRef.current?.();
   102	          } else {
   103	            // The user has no projects, so we need to get them to create one, then close the dialog
   104	            if (!data.viewer.accounts[0]) throw new Error('User has no accounts!');
   105	            if (!data.viewer.accounts[0].newProjectUrl) {
   106	              throw new Error('Unexpected missing project URL');
   107	            }
   108	
   109	            openDialogRef.current?.(data.viewer.accounts[0].newProjectUrl);
   110	          }
   111	        } catch (err) {
   112	          onError('Login Error', err);
   113	        }
   114	      }
   115	
   116	      if (event.message === 'createdProject') {
   117	        if (!accessToken.current) {
   118	          onError('Unexpected missing access token', new Error());
   119	        } else {
   120	          if (!authSession.current) {
   121	            onError('Unexpected missing auth session', new Error());
   122	            return;
   123	          }
   124	          setAuthenticatedSession(authSession.current);
   125	          setAccessToken(accessToken.current);
   126	          setCreatedProjectId(`Project:${event.projectId}`);
   127	          closeDialogRef.current?.();
   128	        }
   129	      }
   130	    },
   131	    [
   132	      state,
   133	      clientId,
   134	      codeVerifier,
   135	      redirectUri,
   136	      sessionId,
   137	      tokenEndpoint,
   138	      subdomain,
   139	      client,
   140	      hasProjectId,
   141	      setAccessToken,
   142	      onError,
   143	      setCreatedProjectId,
   144	    ]
   145	  );
   146	  const [openDialog, closeDialog] = useChromaticDialog(handler);
   147	  openDialogRef.current = openDialog;
   148	  closeDialogRef.current = closeDialog;
   149	
   150	  return (
   151	    <Screen footer={null} ignoreConfig>
   152	      <AuthHeader onBack={onBack} />
   153	      <Container>
   154	        <Stack>
   155	          <div>
   156	            <Heading>Verify your account</Heading>
   157	            <div>
   158	              <Text center muted>
   159	                Continue in Chromatic to approve access to your published Storybooks.
   160	              </Text>
   161	            </div>
   162	          </div>
   163	          <Button
   164	            ariaLabel={false}
   165	            variant="solid"
   166	            size="medium"
   167	            onClick={() => openDialog(authorizationUrl, [redirectOrigin])}
   168	          >
   169	            Go to Chromatic
   170	          </Button>
   171	        </Stack>
   172	      </Container>
   173	    </Screen>
   174	  );
   175	};

 succeeded in 0ms:
     1	import { FailedIcon } from '@storybook/icons';
     2	import React, { useCallback, useEffect } from 'react';
     3	import type { API } from 'storybook/manager-api';
     4	import {
     5	  experimental_getStatusStore,
     6	  useChannel,
     7	  useStorybookApi,
     8	  useStorybookState,
     9	} from 'storybook/manager-api';
    10	import { color } from 'storybook/theming';
    11	
    12	import { AuthProvider } from './AuthContext';
    13	import { Spinner } from './components/design-system';
    14	import {
    15	  ADDON_ID,
    16	  GIT_INFO,
    17	  GIT_INFO_ERROR,
    18	  IS_OFFLINE,
    19	  LOCAL_BUILD_PROGRESS,
    20	  REMOVE_ADDON,
    21	  TELEMETRY,
    22	} from './constants';
    23	import { Authentication } from './screens/Authentication/Authentication';
    24	import { GitError } from './screens/Errors/GitError';
    25	import { LinkedProject } from './screens/LinkProject/LinkedProject';
    26	import { LinkingProjectFailed } from './screens/LinkProject/LinkingProjectFailed';
    27	import { LinkProject } from './screens/LinkProject/LinkProject';
    28	import { NoDevServer } from './screens/NoDevServer/NoDevServer';
    29	import { NoNetwork } from './screens/NoNetwork/NoNetwork';
    30	import { UninstallProvider } from './screens/Uninstalled/UninstallContext';
    31	import { Uninstalled } from './screens/Uninstalled/Uninstalled';
    32	import { ControlsProvider } from './screens/VisualTests/ControlsContext';
    33	import { RunBuildProvider } from './screens/VisualTests/RunBuildContext';
    34	import { VisualTests } from './screens/VisualTests/VisualTests';
    35	import type { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from './types';
    36	import {
    37	  createClient,
    38	  GraphQLClientProvider,
    39	  sessionExpiredEventName,
    40	  useAccessToken,
    41	} from './utils/graphQLClient';
    42	import { TelemetryProvider } from './utils/TelemetryContext';
    43	import { useBuildEvents } from './utils/useBuildEvents';
    44	import { useChannelFetch } from './utils/useChannelFetch';
    45	import { useProjectId } from './utils/useProjectId';
    46	import { clearSessionState, useSessionState } from './utils/useSessionState';
    47	import { useSharedState } from './utils/useSharedState';
    48	
    49	interface PanelProps {
    50	  active: boolean;
    51	  api: API;
    52	}
    53	
    54	const statusStore = experimental_getStatusStore(ADDON_ID);
    55	
    56	export const Panel = ({ active }: PanelProps) => {
    57	  const api = useStorybookApi();
    58	  const [accessToken, updateAccessToken] = useAccessToken();
    59	  const setAccessToken = useCallback(
    60	    (token: string | null) => {
    61	      updateAccessToken(token);
    62	      if (!token) clearSessionState('authenticationScreen', 'exchangeParameters');
    63	    },
    64	    [updateAccessToken]
    65	  );
    66	  const { storyId } = useStorybookState();
    67	
    68	  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
    69	  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);
    70	  const [isOffline] = useSharedState<boolean>(IS_OFFLINE);
    71	  const [localBuildProgress, setLocalBuildProgress] =
    72	    useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);
    73	  const emit = useChannel({});
    74	  useEffect(() => {
    75	    const notify = () => {
    76	      api.addNotification({
    77	        id: `${ADDON_ID}/error/session-expired/${Date.now()}`,
    78	        content: {
    79	          headline: 'Session expired',
    80	          subHeadline: 'Please sign in again to continue.',
    81	        },
    82	        icon: <FailedIcon color={color.negative} />,
    83	      });
    84	    };
    85	
    86	    window.addEventListener(sessionExpiredEventName, notify);
    87	    return () => {
    88	      window.removeEventListener(sessionExpiredEventName, notify);
    89	    };
    90	  }, [api]);
    91	
    92	  const updateBuildStatus = useCallback<UpdateStatusFunction>((statuses) => {
    93	    statusStore.unset();
    94	    statusStore.set(statuses);
    95	  }, []);
    96	
    97	  const {
    98	    loading: projectInfoLoading,
    99	    projectId,
   100	    configFile,
   101	    updateProject,
   102	    projectUpdatingFailed,
   103	    projectIdUpdated,
   104	    clearProjectIdUpdated,
   105	  } = useProjectId();
   106	
   107	  // If the user creates a project in a dialog (either during login or later, it get set here)
   108	  const [createdProjectId, setCreatedProjectId] = useSessionState<string>('createdProjectId');
   109	  const [addonUninstalled, setAddonUninstalled] = useSharedState<boolean>(REMOVE_ADDON);
   110	  const [subdomain, setSubdomain] = useSessionState<string>('subdomain', 'www');
   111	
   112	  const trackEvent = useCallback((data: any) => emit(TELEMETRY, data), [emit]);
   113	  const { isRunning, startBuild, stopBuild } = useBuildEvents({ localBuildProgress, accessToken });
   114	
   115	  const channelFetch = useChannelFetch();
   116	  const fetch = globalThis.LOGLEVEL === 'debug' ? globalThis.fetch : channelFetch;
   117	  const withProviders = (children: React.ReactNode) => (
   118	    <GraphQLClientProvider value={createClient({ fetch })}>
   119	      <TelemetryProvider value={trackEvent}>
   120	        <AuthProvider value={{ accessToken, setAccessToken, subdomain, setSubdomain }}>
   121	          <UninstallProvider
   122	            addonUninstalled={addonUninstalled}
   123	            setAddonUninstalled={setAddonUninstalled}
   124	          >
   125	            <ControlsProvider>
   126	              <RunBuildProvider watchState={{ isRunning, startBuild, stopBuild }}>
   127	                <div hidden={!active} style={{ containerType: 'size', height: '100%' }}>
   128	                  {children}
   129	                </div>
   130	              </RunBuildProvider>
   131	            </ControlsProvider>
   132	          </UninstallProvider>
   133	        </AuthProvider>
   134	      </TelemetryProvider>
   135	    </GraphQLClientProvider>
   136	  );
   137	
   138	  if (!active) {
   139	    return withProviders(null);
   140	  }
   141	
   142	  if (globalThis.CONFIG_TYPE !== 'DEVELOPMENT') {
   143	    return withProviders(<NoDevServer />);
   144	  }
   145	
   146	  if (addonUninstalled) {
   147	    return withProviders(<Uninstalled />);
   148	  }
   149	
   150	  if (isOffline) {
   151	    return withProviders(<NoNetwork offline={isOffline} />);
   152	  }
   153	
   154	  // Render the Authentication flow if the user is not signed in.
   155	  if (!accessToken) {
   156	    return withProviders(
   157	      <Authentication
   158	        setAccessToken={setAccessToken}
   159	        setCreatedProjectId={setCreatedProjectId}
   160	        hasProjectId={!!projectId}

 succeeded in 0ms:
     1	import { authExchange } from '@urql/exchange-auth';
     2	import React from 'react';
     3	import { useAddonState } from 'storybook/manager-api';
     4	import { Client, type ClientOptions, fetchExchange, mapExchange, Provider } from 'urql';
     5	import { v4 as uuid } from 'uuid';
     6	
     7	import { ADDON_ID, OAUTH_CLIENT_ID } from '../constants';
     8	import { ACCESS_TOKEN_KEY, CHROMATIC_API_URL } from '../env';
     9	import { type AuthStorage, AuthStorageSchema, refreshAccessToken } from './requestAccessToken';
    10	
    11	const REFRESH_TIMEOUT_MS = 10_000;
    12	const getStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);
    13	const SESSION_EXPIRED_EVENT = `${ADDON_ID}/session-expired`;
    14	const setBrowserTimeout = (...args: Parameters<typeof globalThis.setTimeout>) =>
    15	  (typeof window !== 'undefined' ? window : globalThis).setTimeout(...args);
    16	const clearBrowserTimeout = (...args: Parameters<typeof globalThis.clearTimeout>) =>
    17	  (typeof window !== 'undefined' ? window : globalThis).clearTimeout(...args);
    18	
    19	let currentAuth: AuthStorage | null = null;
    20	let currentToken: string | null = null;
    21	let refreshPromise: Promise<void> | null = null;
    22	let refreshAbortController: AbortController | null = null;
    23	let authGeneration = 0;
    24	const tokenSubscribers = new Set<(token: string | null) => void>();
    25	const fallbackSessionId = uuid();
    26	
    27	const notifyTokenSubscribers = () => {
    28	  tokenSubscribers.forEach((subscriber) => {
    29	    subscriber(currentToken);
    30	  });
    31	};
    32	
    33	const subscribeToTokenUpdates = (subscriber: (token: string | null) => void) => {
    34	  tokenSubscribers.add(subscriber);
    35	  return () => {
    36	    tokenSubscribers.delete(subscriber);
    37	  };
    38	};
    39	
    40	const notifySessionExpired = () => {
    41	  if (typeof window === 'undefined') {
    42	    return;
    43	  }
    44	  window.dispatchEvent(new window.CustomEvent(SESSION_EXPIRED_EVENT));
    45	};
    46	
    47	const persistCurrentAuth = () => {
    48	  const storage = getStorage();
    49	  if (!storage) {
    50	    return;
    51	  }
    52	  if (currentAuth) {
    53	    storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(currentAuth));
    54	  } else {
    55	    storage.removeItem(ACCESS_TOKEN_KEY);
    56	  }
    57	};
    58	
    59	const setCurrentAuth = (auth: AuthStorage | null) => {
    60	  currentAuth = auth;
    61	  currentToken = auth?.accessToken ?? null;
    62	
    63	  persistCurrentAuth();
    64	  notifyTokenSubscribers();
    65	};
    66	
    67	const clearCurrentAuth = () => {
    68	  authGeneration += 1;
    69	  refreshAbortController?.abort();
    70	  refreshAbortController = null;
    71	  refreshPromise = null;
    72	  setCurrentAuth(null);
    73	};
    74	
    75	const setCurrentToken = (token: string | null) => {
    76	  if (!token) {
    77	    clearCurrentAuth();
    78	    return;
    79	  }
    80	
    81	  if (currentAuth) {
    82	    setCurrentAuth({ ...currentAuth, accessToken: token });
    83	  } else {
    84	    // Keep runtime behavior sane if we ever receive a token before full auth state is initialized.
    85	    currentToken = token;
    86	    notifyTokenSubscribers();
    87	  }
    88	};
    89	
    90	const parseStoredAuth = (rawAuth: string): AuthStorage | null => {
    91	  // Legacy format used to persist only a raw JWT string.
    92	  if (!rawAuth.trim().startsWith('{')) {
    93	    return null;
    94	  }
    95	  const parsed = AuthStorageSchema.safeParse(JSON.parse(rawAuth));
    96	  return parsed.success ? parsed.data : null;
    97	};
    98	
    99	const initializeCurrentAuthFromStorage = () => {
   100	  const storage = getStorage();
   101	  const storedAuth = storage?.getItem(ACCESS_TOKEN_KEY);
   102	  if (!storedAuth) {
   103	    setCurrentAuth(null);
   104	    return;
   105	  }
   106	  try {
   107	    const parsed = parseStoredAuth(storedAuth);
   108	    if (!parsed) {
   109	      storage?.removeItem(ACCESS_TOKEN_KEY);
   110	      setCurrentAuth(null);
   111	      return;
   112	    }
   113	    setCurrentAuth(parsed);
   114	  } catch {
   115	    storage?.removeItem(ACCESS_TOKEN_KEY);
   116	    setCurrentAuth(null);
   117	  }
   118	};
   119	
   120	initializeCurrentAuthFromStorage();
   121	if (typeof window !== 'undefined') {
   122	  window.addEventListener('storage', (event) => {
   123	    if (event.key !== ACCESS_TOKEN_KEY) {
   124	      return;
   125	    }
   126	    if (!event.newValue) {
   127	      setCurrentAuth(null);
   128	      return;
   129	    }
   130	    try {
   131	      const parsed = parseStoredAuth(event.newValue);
   132	      if (!parsed) {
   133	        getStorage()?.removeItem(ACCESS_TOKEN_KEY);
   134	        setCurrentAuth(null);
   135	        return;
   136	      }
   137	      setCurrentAuth(parsed);
   138	    } catch {
   139	      getStorage()?.removeItem(ACCESS_TOKEN_KEY);
   140	      setCurrentAuth(null);
   141	    }
   142	  });
   143	}
   144	
   145	export const setAuthenticatedSession = (auth: AuthStorage) => setCurrentAuth(auth);
   146	
   147	export const useAccessToken = () => {
   148	  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
   149	  const [{ token }, setTokenState] = useAddonState<{ token: string | null }>(
   150	    `${ADDON_ID}/accessToken`,
   151	    { token: currentToken }
   152	  );
   153	
   154	  const updateToken = React.useCallback((newToken: string | null) => {
   155	    setCurrentToken(newToken);
   156	  }, []);
   157	
   158	  React.useEffect(
   159	    () => subscribeToTokenUpdates((nextToken) => setTokenState({ token: nextToken })),
   160	    [setTokenState]
   161	  );
   162	
   163	  return [token, updateToken] as const;
   164	};
   165	
   166	export const getFetchOptions = (token?: string) => ({
   167	  headers: {
   168	    Accept: '*/*',
   169	    ...(token && { Authorization: `Bearer ${token}` }),
   170	    'X-Chromatic-Session-ID': currentAuth?.sessionId || fallbackSessionId,
   171	  },
   172	});
   173	
   174	const isRetryableRefreshError = (error: unknown) => {
   175	  if (error instanceof Error) {
   176	    const statusMatch = error.message.match(/\((\d{3})\)/);
   177	    if (statusMatch) {
   178	      const statusCode = Number(statusMatch[1]);
   179	      return statusCode >= 500;
   180	    }
   181	    if (error.name === 'AbortError') {
   182	      return true;
   183	    }
   184	    return false;
   185	  }
   186	  return false;
   187	};
   188	
   189	const attemptTokenRefresh = async () => {
   190	  const auth = currentAuth;
   191	  if (!auth) {
   192	    throw new Error('Token refresh failed (401)');
   193	  }
   194	
   195	  const generation = authGeneration;
   196	  const abortController = new AbortController();
   197	  refreshAbortController = abortController;
   198	  const timeoutId = setBrowserTimeout(() => abortController.abort(), REFRESH_TIMEOUT_MS);
   199	  try {
   200	    const nextAuth = await refreshAccessToken({
   201	      clientId: OAUTH_CLIENT_ID,
   202	      subdomain: auth.subdomain,
   203	      refreshToken: auth.refreshToken,
   204	      sessionId: auth.sessionId,
   205	      signal: abortController.signal,
   206	    });
   207	    if (generation !== authGeneration) {
   208	      return;
   209	    }
   210	    setCurrentAuth(nextAuth);
   211	  } finally {
   212	    clearBrowserTimeout(timeoutId);
   213	    refreshAbortController = null;
   214	  }
   215	};
   216	
   217	const refreshCurrentSession = async () => {
   218	  if (!currentAuth) {
   219	    clearCurrentAuth();
   220	    return;
   221	  }
   222	
   223	  if (!refreshPromise) {
   224	    refreshPromise = (async () => {
   225	      try {
   226	        await attemptTokenRefresh();
   227	      } catch (error) {
   228	        if (isRetryableRefreshError(error)) {
   229	          await attemptTokenRefresh();
   230	          return;
   231	        }
   232	        throw error;
   233	      }
   234	    })()
   235	      .catch((error) => {
   236	        console.warn('Session expired. Please sign in again.');
   237	        clearCurrentAuth();
   238	        notifySessionExpired();
   239	        throw error;
   240	      })
   241	      .finally(() => {
   242	        refreshPromise = null;
   243	      });
   244	  }
   245	
   246	  await refreshPromise;
   247	};
   248	
   249	export const createClient = (options?: Partial<ClientOptions>) =>
   250	  new Client({
   251	    url: CHROMATIC_API_URL,
   252	    exchanges: [
   253	      // We don't use cacheExchange, because it would inadvertently share data between stories.
   254	      mapExchange({
   255	        onResult(result) {
   256	          // Not all queries contain the `viewer` field, in which case it will be `undefined`.
   257	          // When we do retrieve the field but the token is invalid, it will be `null`.
   258	          if (result.data?.viewer === null) setCurrentToken(null);
   259	        },
   260	      }),

 succeeded in 0ms:
     1	import { z } from 'zod';
     2	
     3	import { OAUTH_CLIENT_ID } from '../constants';
     4	import { CHROMATIC_BASE_URL } from '../env';
     5	// @ts-expect-error File is in plain JS
     6	import { sha256 } from './sha256';
     7	
     8	// Details we exchange with the Chromatic OAuth server
     9	export type TokenExchangeParameters = {
    10	  clientId: string;
    11	  redirectUri: string;
    12	  codeVerifier: string;
    13	  state: string;
    14	  sessionId: string;
    15	  authorizationUrl: string;
    16	  tokenEndpoint: string;
    17	  subdomain?: string;
    18	};
    19	
    20	const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{0,62}$/;
    21	
    22	export const AuthStorageSchema = z.object({
    23	  version: z.literal(2),
    24	  accessToken: z.string().min(1),
    25	  refreshToken: z.string().min(1),
    26	  subdomain: z.string().regex(SUBDOMAIN_REGEX).optional(),
    27	  sessionId: z.string().min(1),
    28	});
    29	export type AuthStorage = z.infer<typeof AuthStorageSchema>;
    30	
    31	const TokenResponseSchema = z.object({
    32	  access_token: z.string().min(1),
    33	  refresh_token: z.string().min(1).optional(),
    34	  error: z.string().optional(),
    35	  error_description: z.string().optional(),
    36	});
    37	
    38	export type TokenResponse = z.infer<typeof TokenResponseSchema>;
    39	
    40	const bytes = (buf: number[]) =>
    41	  new Uint8Array(buf).reduce((acc, val) => acc + String.fromCharCode(val), '');
    42	
    43	const base64 = (val: string | number[]) => window.btoa(Array.isArray(val) ? bytes(val) : val);
    44	
    45	const base64URLEncode = (val: string | number[]) =>
    46	  base64(val).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    47	
    48	const hexStringToBytes = (str: string) =>
    49	  Array.from(str.match(/.{1,2}/g) ?? [], (byte) => parseInt(byte, 16));
    50	
    51	const randomBase64Url = (byteLength: number) => {
    52	  const randomValues = new Uint8Array(byteLength);
    53	  window.crypto.getRandomValues(randomValues);
    54	  return base64URLEncode(Array.from(randomValues));
    55	};
    56	
    57	const encodeParams = (params: Record<string, string | number | boolean>) =>
    58	  Object.entries(params)
    59	    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    60	    .join('&');
    61	
    62	const resolveChromaticHost = (subdomain?: string) => {
    63	  if (!subdomain) {
    64	    return CHROMATIC_BASE_URL;
    65	  }
    66	  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    67	    throw new Error('Invalid Chromatic subdomain');
    68	  }
    69	  const base = new URL(CHROMATIC_BASE_URL);
    70	  if (base.hostname.startsWith('www.')) {
    71	    base.hostname = `${subdomain}.${base.hostname.slice(4)}`;
    72	  }
    73	  return base.origin;
    74	};
    75	
    76	export const resolveTokenEndpoint = (subdomain?: string) =>
    77	  `${resolveChromaticHost(subdomain)}/token`;
    78	
    79	export const initiateSignin = async (subdomain?: string): Promise<TokenExchangeParameters> => {
    80	  const state = randomBase64Url(32);
    81	  const codeVerifier = randomBase64Url(64);
    82	  const sessionId = window.crypto.randomUUID();
    83	  const codeChallenge = base64URLEncode(hexStringToBytes(sha256(codeVerifier)));
    84	  const chromaticBaseUrl = resolveChromaticHost(subdomain);
    85	  const redirectUri = window.location.href.split(/[?#]/)[0];
    86	  const authorizationUrl = `${chromaticBaseUrl}/authorize?${encodeParams({
    87	    client_id: OAUTH_CLIENT_ID,
    88	    response_type: 'code',
    89	    code_challenge: codeChallenge,
    90	    code_challenge_method: 'S256',
    91	    redirect_uri: redirectUri,
    92	    state,
    93	    scope: 'user:read account:read project:read build:read build:write build:create',
    94	  })}`;
    95	
    96	  return {
    97	    clientId: OAUTH_CLIENT_ID,
    98	    redirectUri,
    99	    codeVerifier,
   100	    state,
   101	    sessionId,
   102	    authorizationUrl,
   103	    tokenEndpoint: `${chromaticBaseUrl}/token`,
   104	    subdomain,
   105	  };
   106	};
   107	
   108	const decodeTokenResponse = async (
   109	  res: Response,
   110	  failureMessage: string
   111	): Promise<TokenResponse> => {
   112	  const rawData = await res.json();
   113	  if (rawData?.error === 'authorization_pending') {
   114	    throw new Error(
   115	      `You have not authorized the Visual Tests addon for Chromatic, please try again`
   116	    );
   117	  }
   118	  const parsed = TokenResponseSchema.safeParse(rawData);
   119	  if (parsed.success) {
   120	    return parsed.data;
   121	  }
   122	  const message = rawData?.error_description || rawData?.error || failureMessage;
   123	  throw new Error(message);
   124	};
   125	
   126	export const fetchAccessToken = async ({
   127	  clientId,
   128	  codeVerifier,
   129	  redirectUri,
   130	  sessionId,
   131	  tokenEndpoint,
   132	  subdomain,
   133	  code,
   134	}: Pick<
   135	  TokenExchangeParameters,
   136	  'clientId' | 'codeVerifier' | 'redirectUri' | 'tokenEndpoint' | 'sessionId' | 'subdomain'
   137	> & {
   138	  code: string;
   139	}): Promise<AuthStorage> => {
   140	  const res = await fetch(tokenEndpoint, {
   141	    method: 'POST',
   142	    headers: {
   143	      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
   144	      'X-Chromatic-Session-ID': sessionId,
   145	    },
   146	    body: encodeParams({
   147	      client_id: clientId,
   148	      grant_type: 'authorization_code',
   149	      code,
   150	      redirect_uri: redirectUri,
   151	      code_verifier: codeVerifier,
   152	    }),
   153	  });
   154	  const data = await decodeTokenResponse(res, 'Token exchange failed');
   155	  if (!data.refresh_token) {
   156	    throw new Error('Token exchange failed: missing refresh token');
   157	  }
   158	  return {
   159	    version: 2,
   160	    accessToken: data.access_token,
   161	    refreshToken: data.refresh_token,
   162	    sessionId,
   163	    ...(subdomain ? { subdomain } : {}),
   164	  };
   165	};
   166	
   167	export const refreshAccessToken = async ({
   168	  clientId,
   169	  subdomain,
   170	  refreshToken,
   171	  sessionId,
   172	  signal,
   173	}: {
   174	  clientId: string;
   175	  subdomain?: string;
   176	  refreshToken: string;
   177	  sessionId: string;
   178	  signal: AbortSignal;
   179	}): Promise<AuthStorage> => {
   180	  const tokenEndpoint = resolveTokenEndpoint(subdomain);
   181	  const res = await fetch(tokenEndpoint, {
   182	    method: 'POST',
   183	    signal,
   184	    headers: {
   185	      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
   186	      'X-Chromatic-Session-ID': sessionId,
   187	    },
   188	    body: encodeParams({
   189	      client_id: clientId,
   190	      grant_type: 'refresh_token',
   191	      refresh_token: refreshToken,
   192	    }),
   193	  });
   194	
   195	  if (!res.ok) {
   196	    throw new Error(`Token refresh failed (${res.status})`);
   197	  }
   198	
   199	  const data = await decodeTokenResponse(res, 'Token refresh failed');
   200	  return {
   201	    version: 2,
   202	    accessToken: data.access_token,
   203	    refreshToken: data.refresh_token ?? refreshToken,
   204	    sessionId,
   205	    ...(subdomain ? { subdomain } : {}),
   206	  };
   207	};

exec
/bin/zsh -lc "nl -ba src/utils/graphQLClient.tsx | sed -n '260,420p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
   260	      }),
   261	      authExchange(async (utils) => {
   262	        return {
   263	          addAuthToOperation(operation) {
   264	            if (!currentToken) return operation;
   265	            return utils.appendHeaders(operation, { Authorization: `Bearer ${currentToken}` });
   266	          },
   267	
   268	          // Determine if the current error is an authentication error.
   269	          didAuthError: (error) =>
   270	            error.response?.status === 401 ||
   271	            error.graphQLErrors.some((e) => e.message.includes('Must login')),
   272	
   273	          // Refresh access token on demand after auth failures.
   274	          async refreshAuth() {
   275	            await refreshCurrentSession();
   276	          },
   277	
   278	          // Reactive auth: only refresh after auth failures, not pre-emptively by token expiry.
   279	          willAuthError() {
   280	            return !currentToken;
   281	          },
   282	        };
   283	      }),
   284	      fetchExchange,
   285	    ],
   286	    fetchOptions: getFetchOptions(), // Auth header (token) is handled by authExchange
   287	    ...options,
   288	  });
   289	
   290	export const __testUtils = {
   291	  getCurrentAuth: () => currentAuth,
   292	  clearCurrentAuth,
   293	  subscribeToTokenUpdates,
   294	  refreshCurrentSession,
   295	};
   296	
   297	export const sessionExpiredEventName = SESSION_EXPIRED_EVENT;
   298	
   299	export const GraphQLClientProvider = ({
   300	  children,
   301	  value = createClient(),
   302	}: {
   303	  children: React.ReactNode;
   304	  value?: Client;
   305	}) => <Provider value={value}>{children}</Provider>;

exec
/bin/zsh -lc "nl -ba src/utils/oauthGrant.ts | sed -n '1,180p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
     1	import {
     2	  type AuthStorage,
     3	  fetchAccessToken,
     4	  type TokenExchangeParameters,
     5	} from './requestAccessToken';
     6	import type { DialogHandler } from './useChromaticDialog';
     7	
     8	type DialogPayload = Parameters<DialogHandler>[0];
     9	
    10	export type GrantOutcome =
    11	  | { kind: 'login' }
    12	  | { kind: 'error'; message: string }
    13	  | { kind: 'ignore' }
    14	  | { kind: 'code'; code: string };
    15	
    16	export const exchangeOAuthCode = (
    17	  params: Pick<
    18	    TokenExchangeParameters,
    19	    'clientId' | 'codeVerifier' | 'redirectUri' | 'tokenEndpoint' | 'sessionId' | 'subdomain'
    20	  >,
    21	  code: string
    22	): Promise<AuthStorage> => fetchAccessToken({ ...params, code });
    23	
    24	export const parseGrantPayload = (event: DialogPayload, expectedState: string): GrantOutcome => {
    25	  if (event.message === 'login') return { kind: 'login' };
    26	  if (event.message !== 'grant') return { kind: 'ignore' };
    27	
    28	  if ('error' in event) {
    29	    if (!('state' in event) || event.state !== expectedState) return { kind: 'ignore' };
    30	    return { kind: 'error', message: event.error_description || event.error };
    31	  }
    32	  if (!('code' in event) || !('state' in event)) {
    33	    return { kind: 'error', message: 'Unexpected OAuth callback payload' };
    34	  }
    35	  if (event.state !== expectedState) {
    36	    return { kind: 'error', message: 'Invalid OAuth state' };
    37	  }
    38	  return { kind: 'code', code: event.code };
    39	};

exec
/bin/zsh -lc "nl -ba eslint.config.mjs | sed -n '55,130p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
    55	      'import/named': 'off',
    56	      'import/order': 'off',
    57	
    58	      // "import/no-extraneous-dependencies": ["error", {
    59	      //     devDependencies: true,
    60	      // }],
    61	
    62	      '@typescript-eslint/ban-ts-comment': [
    63	        'error',
    64	        {
    65	          'ts-expect-error': 'allow-with-description',
    66	          'ts-ignore': 'allow-with-description',
    67	          'ts-nocheck': 'allow-with-description',
    68	          'ts-check': 'allow-with-description',
    69	          minimumDescriptionLength: 3,
    70	        },
    71	      ],
    72	
    73	      'jest/no-deprecated-functions': 'off',
    74	
    75	      // Ban common DOM/JS sinks used for runtime code/HTML injection.
    76	      'no-restricted-syntax': [
    77	        'error',
    78	        {
    79	          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    80	          message: 'dangerouslySetInnerHTML is banned',
    81	        },
    82	        {
    83	          selector: "AssignmentExpression[left.property.name='innerHTML']",
    84	          message: 'innerHTML assignment is banned',
    85	        },
    86	        {
    87	          selector: "AssignmentExpression[left.property.name='outerHTML']",
    88	          message: 'outerHTML assignment is banned',
    89	        },
    90	        {
    91	          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    92	          message: 'insertAdjacentHTML is banned',
    93	        },
    94	        {
    95	          selector:
    96	            "CallExpression[callee.object.name='document'][callee.property.name=/^writeln?$/]",
    97	          message: 'document.write/writeln is banned',
    98	        },
    99	        {
   100	          selector: "JSXAttribute[name.name='srcdoc']",
   101	          message: 'iframe srcdoc is banned',
   102	        },
   103	        {
   104	          selector: "CallExpression[callee.property.name='createContextualFragment']",
   105	          message: 'createContextualFragment is banned',
   106	        },
   107	        {
   108	          selector:
   109	            "CallExpression[callee.name=/^(setTimeout|setInterval)$/][arguments.0.type='Literal']",
   110	          message: 'String-form setTimeout/setInterval is banned',
   111	        },
   112	        {
   113	          selector: "CallExpression[callee.name='eval']",
   114	          message: 'eval is banned',
   115	        },
   116	        {
   117	          selector: "NewExpression[callee.name='Function']",
   118	          message: 'Function constructor is banned',
   119	        },
   120	      ],
   121	    },
   122	  },
   123	];

exec
/bin/zsh -lc "nl -ba src/utils/graphQLClient.test.ts | sed -n '1,230p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
     1	import { beforeEach, describe, expect, it, vi } from 'vitest';
     2	
     3	import { ACCESS_TOKEN_KEY } from '../env';
     4	import { __testUtils, setAuthenticatedSession } from './graphQLClient';
     5	import type { AuthStorage } from './requestAccessToken';
     6	
     7	const createAuth = (overrides: Partial<AuthStorage> = {}): AuthStorage => ({
     8	  version: 2,
     9	  accessToken: 'access-token-1',
    10	  refreshToken: 'refresh-token-1',
    11	  sessionId: 'session-id-1',
    12	  ...overrides,
    13	});
    14	
    15	const ensureLocalStorage = () => {
    16	  if (globalThis.localStorage) {
    17	    return;
    18	  }
    19	  let store: Record<string, string> = {};
    20	  Object.defineProperty(globalThis, 'localStorage', {
    21	    configurable: true,
    22	    value: {
    23	      getItem: (key: string) => store[key] ?? null,
    24	      setItem: (key: string, value: string) => {
    25	        store[key] = String(value);
    26	      },
    27	      removeItem: (key: string) => {
    28	        delete store[key];
    29	      },
    30	      clear: () => {
    31	        store = {};
    32	      },
    33	      key: (index: number) => Object.keys(store)[index] ?? null,
    34	      get length() {
    35	        return Object.keys(store).length;
    36	      },
    37	    } satisfies Storage,
    38	  });
    39	};
    40	
    41	describe('graphQLClient refresh auth', () => {
    42	  beforeEach(() => {
    43	    ensureLocalStorage();
    44	    localStorage.clear();
    45	    vi.restoreAllMocks();
    46	  });
    47	
    48	  it('updates access and refresh tokens after successful refresh', async () => {
    49	    setAuthenticatedSession(createAuth());
    50	    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    51	      new Response(
    52	        JSON.stringify({
    53	          access_token: 'access-token-2',
    54	          refresh_token: 'refresh-token-2',
    55	        }),
    56	        { status: 200 }
    57	      )
    58	    );
    59	
    60	    await __testUtils.refreshCurrentSession();
    61	
    62	    expect(__testUtils.getCurrentAuth()).toMatchObject({
    63	      accessToken: 'access-token-2',
    64	      refreshToken: 'refresh-token-2',
    65	      sessionId: 'session-id-1',
    66	    });
    67	
    68	    expect(JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY) || '{}')).toMatchObject({
    69	      accessToken: 'access-token-2',
    70	      refreshToken: 'refresh-token-2',
    71	      sessionId: 'session-id-1',
    72	    });
    73	  });
    74	
    75	  it('notifies token subscribers when refresh updates token', async () => {
    76	    setAuthenticatedSession(createAuth());
    77	    const subscriber = vi.fn();
    78	    const unsubscribe = __testUtils.subscribeToTokenUpdates(subscriber);
    79	    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    80	      new Response(
    81	        JSON.stringify({
    82	          access_token: 'access-token-2',
    83	          refresh_token: 'refresh-token-2',
    84	        }),
    85	        { status: 200 }
    86	      )
    87	    );
    88	
    89	    await __testUtils.refreshCurrentSession();
    90	    unsubscribe();
    91	
    92	    expect(subscriber).toHaveBeenLastCalledWith('access-token-2');
    93	  });
    94	
    95	  it('clears auth state and rejects when refresh fails with terminal error', async () => {
    96	    setAuthenticatedSession(createAuth());
    97	    vi.spyOn(console, 'warn').mockImplementation(() => {});
    98	    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 401 }));
    99	
   100	    await expect(__testUtils.refreshCurrentSession()).rejects.toThrow('Token refresh failed (401)');
   101	
   102	    expect(__testUtils.getCurrentAuth()).toBeNull();
   103	    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
   104	  });
   105	
   106	  it('does not retry terminal OAuth refresh errors', async () => {
   107	    setAuthenticatedSession(createAuth());
   108	    vi.spyOn(console, 'warn').mockImplementation(() => {});
   109	    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
   110	      new Response(
   111	        JSON.stringify({
   112	          error: 'invalid_grant',
   113	        }),
   114	        { status: 200 }
   115	      )
   116	    );
   117	
   118	    await expect(__testUtils.refreshCurrentSession()).rejects.toThrow('invalid_grant');
   119	
   120	    expect(fetchSpy).toHaveBeenCalledTimes(1);
   121	  });
   122	
   123	  it('reuses the previous refresh token when refresh response omits rotation', async () => {
   124	    setAuthenticatedSession(createAuth());
   125	    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
   126	      new Response(
   127	        JSON.stringify({
   128	          access_token: 'access-token-2',
   129	        }),
   130	        { status: 200 }
   131	      )
   132	    );
   133	
   134	    await __testUtils.refreshCurrentSession();
   135	
   136	    expect(__testUtils.getCurrentAuth()).toMatchObject({
   137	      accessToken: 'access-token-2',
   138	      refreshToken: 'refresh-token-1',
   139	    });
   140	  });
   141	
   142	  it('does not restore auth after logout while refresh is in flight', async () => {
   143	    setAuthenticatedSession(createAuth());
   144	    let resolveRefresh!: (response: Response) => void;
   145	    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
   146	      () =>
   147	        new Promise<Response>((resolve) => {
   148	          resolveRefresh = resolve;
   149	        })
   150	    );
   151	
   152	    const refreshPromise = __testUtils.refreshCurrentSession();
   153	    __testUtils.clearCurrentAuth();
   154	    resolveRefresh(
   155	      new Response(
   156	        JSON.stringify({
   157	          access_token: 'access-token-2',
   158	          refresh_token: 'refresh-token-2',
   159	        }),
   160	        { status: 200 }
   161	      )
   162	    );
   163	
   164	    await refreshPromise;
   165	
   166	    expect(__testUtils.getCurrentAuth()).toBeNull();
   167	    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
   168	  });
   169	});

codex
I’ve got the core refresh flow now. I’m checking the dialog and auth call sites next because the biggest risks are state transitions across popup messages and stale client state, not just the token POST itself.
exec
/bin/zsh -lc "rg -n \"setAccessToken|useAccessToken|setAuthenticatedSession|exchangeOAuthCode|sessionExpiredEventName|ACCESS_TOKEN_KEY|useChromaticDialog|parseGrantPayload\" src test* --glob '"'!node_modules'"'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 exited 1 in 0ms:
zsh:1: no matches found: test*

exec
/bin/zsh -lc "nl -ba src/screens/Authentication/Authentication.tsx | sed -n '1,220p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
exec
/bin/zsh -lc "nl -ba src/screens/ShareSection/useShareAuth.ts | sed -n '1,160p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
exec
/bin/zsh -lc "nl -ba src/utils/useChromaticDialog.ts | sed -n '1,260p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
     1	import React, { useCallback } from 'react';
     2	
     3	import { useAuthState } from '../../AuthContext';
     4	import { Project } from '../../gql/graphql';
     5	import { initiateSignin, TokenExchangeParameters } from '../../utils/requestAccessToken';
     6	import { useTelemetry } from '../../utils/TelemetryContext';
     7	import { useErrorNotification } from '../../utils/useErrorNotification';
     8	import { useSessionState } from '../../utils/useSessionState';
     9	import { useUninstallAddon } from '../Uninstalled/UninstallContext';
    10	import { SetSubdomain } from './SetSubdomain';
    11	import { SignIn } from './SignIn';
    12	import { Verify } from './Verify';
    13	import { Welcome } from './Welcome';
    14	
    15	interface AuthenticationProps {
    16	  setAccessToken: (token: string | null) => void;
    17	  setCreatedProjectId: (projectId: Project['id']) => void;
    18	  hasProjectId: boolean;
    19	}
    20	
    21	type AuthenticationScreen = 'welcome' | 'signin' | 'subdomain' | 'verify';
    22	
    23	export const Authentication = ({
    24	  setAccessToken,
    25	  setCreatedProjectId,
    26	  hasProjectId,
    27	}: AuthenticationProps) => {
    28	  const [screen, setScreen] = useSessionState<AuthenticationScreen>(
    29	    'authenticationScreen',
    30	    hasProjectId ? 'signin' : 'welcome'
    31	  );
    32	  const [exchangeParameters, setExchangeParameters] =
    33	    useSessionState<TokenExchangeParameters>('exchangeParameters');
    34	  const onError = useErrorNotification();
    35	  const { uninstallAddon } = useUninstallAddon();
    36	  const { setSubdomain } = useAuthState();
    37	
    38	  useTelemetry('Authentication', screen.charAt(0).toUpperCase() + screen.slice(1));
    39	
    40	  const initiateSignInAndMoveToVerify = useCallback(
    41	    async (subdomain?: string) => {
    42	      try {
    43	        setSubdomain(subdomain ?? 'www');
    44	        setExchangeParameters(await initiateSignin(subdomain));
    45	        setScreen('verify');
    46	      } catch (err: any) {
    47	        onError('Sign in Error', err);
    48	      }
    49	    },
    50	    [onError, setExchangeParameters, setScreen, setSubdomain]
    51	  );
    52	
    53	  if (screen === 'welcome' && !hasProjectId) {
    54	    return <Welcome onNext={() => setScreen('signin')} onUninstall={uninstallAddon} />;
    55	  }
    56	
    57	  if (screen === 'signin' || (screen === 'welcome' && hasProjectId)) {
    58	    return (
    59	      <SignIn
    60	        {...(!hasProjectId ? { onBack: () => setScreen('welcome') } : {})}
    61	        onSignIn={initiateSignInAndMoveToVerify}
    62	        onSignInWithSSO={() => setScreen('subdomain')}
    63	      />
    64	    );
    65	  }
    66	
    67	  if (screen === 'subdomain') {
    68	    return (
    69	      <SetSubdomain onBack={() => setScreen('signin')} onSignIn={initiateSignInAndMoveToVerify} />
    70	    );
    71	  }
    72	
    73	  if (screen === 'verify') {
    74	    if (!exchangeParameters) {
    75	      throw new Error('Expected to have a `exchangeParameters` if at `verify` step');
    76	    }
    77	    return (
    78	      <Verify
    79	        onBack={() => setScreen('signin')}
    80	        hasProjectId={hasProjectId}
    81	        setAccessToken={setAccessToken}
    82	        setCreatedProjectId={setCreatedProjectId}
    83	        exchangeParameters={exchangeParameters}
    84	      />
    85	    );
    86	  }
    87	
    88	  return null;
    89	};

 succeeded in 0ms:
     1	import { useCallback, useRef } from 'react';
     2	
     3	import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
     4	import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
     5	import { initiateSignin, type TokenExchangeParameters } from '../../utils/requestAccessToken';
     6	import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
     7	import type { ShareState } from './types';
     8	
     9	export function useShareAuth(setShareState: (s: ShareState) => void) {
    10	  const [, updateToken] = useAccessToken();
    11	  const paramsRef = useRef<TokenExchangeParameters | null>(null);
    12	  const openDialogRef = useRef<(url: string, additionalOrigins?: string[]) => void>();
    13	  const closeDialogRef = useRef<() => void>();
    14	
    15	  const handler = useCallback<DialogHandler>(
    16	    async (event) => {
    17	      const params = paramsRef.current;
    18	      if (!params) return;
    19	
    20	      const { redirectUri, state, clientId, codeVerifier, tokenEndpoint, sessionId, subdomain } =
    21	        params;
    22	      const outcome = parseGrantPayload(event, state);
    23	
    24	      if (outcome.kind === 'login' || outcome.kind === 'ignore') {
    25	        return;
    26	      }
    27	
    28	      if (outcome.kind === 'error') {
    29	        paramsRef.current = null;
    30	        closeDialogRef.current?.();
    31	        setShareState({ status: 'error', reason: 'unknown' });
    32	        return;
    33	      }
    34	
    35	      paramsRef.current = null;
    36	
    37	      try {
    38	        const token = await exchangeOAuthCode(
    39	          { clientId, codeVerifier, redirectUri, tokenEndpoint, sessionId, subdomain },
    40	          outcome.code
    41	        );
    42	
    43	        setAuthenticatedSession(token);
    44	        updateToken(token.accessToken);
    45	        closeDialogRef.current?.();
    46	        setShareState({ status: 'uploading', shareUrl: '' });
    47	      } catch {
    48	        closeDialogRef.current?.();
    49	        setShareState({ status: 'error', reason: 'unknown' });
    50	      }
    51	    },
    52	    [setShareState, updateToken]
    53	  );
    54	
    55	  const [openDialog, closeDialog] = useChromaticDialog(handler);
    56	  openDialogRef.current = openDialog;
    57	  closeDialogRef.current = closeDialog;
    58	
    59	  const startSignIn = useCallback(
    60	    async (subdomain?: string) => {
    61	      try {
    62	        const params = await initiateSignin(subdomain);
    63	        paramsRef.current = params;
    64	        const redirectOrigin = new URL(params.redirectUri).origin;
    65	        openDialogRef.current?.(params.authorizationUrl, [redirectOrigin]);
    66	      } catch {
    67	        setShareState({ status: 'error', reason: 'unknown' });
    68	      }
    69	    },
    70	    [setShareState]
    71	  );
    72	
    73	  return { startSignIn, updateToken };
    74	}

 succeeded in 0ms:
     1	import { useCallback, useEffect, useRef } from 'react';
     2	import { z } from 'zod';
     3	
     4	const dialogPayloadSchema = z.union([
     5	  z.object({ message: z.literal('login') }),
     6	  z.object({
     7	    message: z.literal('grant'),
     8	    code: z.string(),
     9	    state: z.string(),
    10	  }),
    11	  z.object({
    12	    message: z.literal('grant'),
    13	    error: z.string(),
    14	    error_description: z.string().optional(),
    15	    state: z.string().optional(),
    16	  }),
    17	  z.object({ message: z.literal('createdProject'), projectId: z.string() }),
    18	]);
    19	
    20	type Schema = z.infer<typeof dialogPayloadSchema>;
    21	
    22	export type DialogHandler = (payload: Schema) => void;
    23	
    24	export const useChromaticDialog = (handler?: DialogHandler) => {
    25	  const dialog = useRef<Window | null>();
    26	  const allowedOrigins = useRef<Set<string>>(new Set());
    27	
    28	  useEffect(() => {
    29	    const handleMessage = ({ origin, data, source }: MessageEvent) => {
    30	      if (!allowedOrigins.current.has(origin)) {
    31	        return;
    32	      }
    33	      if (source !== dialog.current) {
    34	        return;
    35	      }
    36	
    37	      let parsed: Schema;
    38	      try {
    39	        parsed = dialogPayloadSchema.parse(data);
    40	      } catch (_) {
    41	        // Don't log anything on parsing errors, as we can get messages from things like intercom
    42	        return;
    43	      }
    44	      handler?.(parsed);
    45	    };
    46	
    47	    window.addEventListener('message', handleMessage);
    48	
    49	    return () => window.removeEventListener('message', handleMessage);
    50	  }, [handler]);
    51	
    52	  return [
    53	    useCallback((url: string, additionalOrigins: string[] = []) => {
    54	      const width = 800;
    55	      const height = 800;
    56	      const usePopup = window.innerWidth > width && window.innerHeight > height;
    57	
    58	      if (usePopup) {
    59	        const left = (window.innerWidth - width) / 2 + window.screenLeft;
    60	        const top = (window.innerHeight - height) / 2 + window.screenTop;
    61	        const options = `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`;
    62	        dialog.current = window.open(url, 'chromatic-dialog', options);
    63	        dialog.current?.focus();
    64	      } else {
    65	        dialog.current = window.open(url, '_blank');
    66	      }
    67	      if (!dialog.current) {
    68	        return;
    69	      }
    70	      const { origin } = new URL(url);
    71	      allowedOrigins.current = new Set([origin, ...additionalOrigins]);
    72	    }, []),
    73	
    74	    useCallback(() => dialog.current?.close(), []),
    75	  ] as const;
    76	};

exec
/bin/zsh -lc "rg -n \"setAccessToken|useAccessToken|setAuthenticatedSession|exchangeOAuthCode|sessionExpiredEventName|ACCESS_TOKEN_KEY|useChromaticDialog|parseGrantPayload\" src --glob '"'!node_modules'"'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
src/env.ts:9:export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
src/Panel.tsx:39:  sessionExpiredEventName,
src/Panel.tsx:40:  useAccessToken,
src/Panel.tsx:58:  const [accessToken, updateAccessToken] = useAccessToken();
src/Panel.tsx:59:  const setAccessToken = useCallback(
src/Panel.tsx:86:    window.addEventListener(sessionExpiredEventName, notify);
src/Panel.tsx:88:      window.removeEventListener(sessionExpiredEventName, notify);
src/Panel.tsx:120:        <AuthProvider value={{ accessToken, setAccessToken, subdomain, setSubdomain }}>
src/Panel.tsx:158:        setAccessToken={setAccessToken}
src/AuthContext.tsx:7:  setAccessToken: (accessToken: string | null) => void;
src/screens/LinkProject/LinkProject.tsx:15:import { DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
src/screens/LinkProject/LinkProject.tsx:183:  const [openDialog, closeDialog] = useChromaticDialog(handler);
src/utils/oauthGrant.test.ts:3:import { parseGrantPayload } from './oauthGrant';
src/utils/oauthGrant.test.ts:5:describe('parseGrantPayload', () => {
src/utils/oauthGrant.test.ts:7:    expect(parseGrantPayload({ message: 'login' }, 'state')).toEqual({ kind: 'login' });
src/utils/oauthGrant.test.ts:12:      parseGrantPayload({ message: 'createdProject', projectId: 'p1' } as any, 'state')
src/utils/oauthGrant.test.ts:17:    const result = parseGrantPayload(
src/utils/oauthGrant.test.ts:30:    const result = parseGrantPayload(
src/utils/oauthGrant.test.ts:38:    const result = parseGrantPayload({ message: 'grant', error: 'server_error' }, 'expected');
src/utils/oauthGrant.test.ts:43:    const result = parseGrantPayload(
src/utils/oauthGrant.test.ts:51:    const result = parseGrantPayload({ message: 'grant', state: 'abc' } as any, 'abc');
src/utils/oauthGrant.test.ts:56:    const result = parseGrantPayload({ message: 'grant', code: 'xyz' } as any, 'abc');
src/utils/oauthGrant.test.ts:61:    const result = parseGrantPayload({ message: 'grant', code: 'xyz', state: 'wrong' }, 'expected');
src/utils/oauthGrant.test.ts:66:    const result = parseGrantPayload({ message: 'grant', code: 'auth-code', state: 'abc' }, 'abc');
src/utils/useChromaticDialog.ts:24:export const useChromaticDialog = (handler?: DialogHandler) => {
src/screens/ShareSection/ShareSection.test.tsx:43:  useAccessToken: () => ['token-123', mocks.updateToken],
src/utils/oauthGrant.ts:6:import type { DialogHandler } from './useChromaticDialog';
src/utils/oauthGrant.ts:16:export const exchangeOAuthCode = (
src/utils/oauthGrant.ts:24:export const parseGrantPayload = (event: DialogPayload, expectedState: string): GrantOutcome => {
src/screens/Authentication/Authentication.stories.tsx:20:    setAccessToken: fn().mockName('setAccessToken'),
src/utils/useChromaticDialog.test.ts:66:const { useChromaticDialog } = await import('./useChromaticDialog');
src/utils/useChromaticDialog.test.ts:68:describe('useChromaticDialog', () => {
src/utils/useChromaticDialog.test.ts:71:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:81:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:91:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:103:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:114:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:124:    const [openDialog] = useChromaticDialog(handler);
src/utils/useChromaticDialog.test.ts:143:    const [openDialog, closeDialog] = useChromaticDialog();
src/screens/ShareSection/useShareAuth.ts:3:import { setAuthenticatedSession, useAccessToken } from '../../utils/graphQLClient';
src/screens/ShareSection/useShareAuth.ts:4:import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
src/screens/ShareSection/useShareAuth.ts:6:import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
src/screens/ShareSection/useShareAuth.ts:10:  const [, updateToken] = useAccessToken();
src/screens/ShareSection/useShareAuth.ts:22:      const outcome = parseGrantPayload(event, state);
src/screens/ShareSection/useShareAuth.ts:38:        const token = await exchangeOAuthCode(
src/screens/ShareSection/useShareAuth.ts:43:        setAuthenticatedSession(token);
src/screens/ShareSection/useShareAuth.ts:55:  const [openDialog, closeDialog] = useChromaticDialog(handler);
src/utils/graphQLClient.test.ts:3:import { ACCESS_TOKEN_KEY } from '../env';
src/utils/graphQLClient.test.ts:4:import { __testUtils, setAuthenticatedSession } from './graphQLClient';
src/utils/graphQLClient.test.ts:49:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:68:    expect(JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY) || '{}')).toMatchObject({
src/utils/graphQLClient.test.ts:76:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:96:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:103:    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
src/utils/graphQLClient.test.ts:107:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:124:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:143:    setAuthenticatedSession(createAuth());
src/utils/graphQLClient.test.ts:167:    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
src/components/FooterMenu.tsx:13:  const { accessToken, setAccessToken, subdomain } = useAuthState();
src/components/FooterMenu.tsx:75:                  setAccessToken(null);
src/screens/Authentication/Verify.tsx:12:import { getFetchOptions, setAuthenticatedSession } from '../../utils/graphQLClient';
src/screens/Authentication/Verify.tsx:13:import { exchangeOAuthCode, parseGrantPayload } from '../../utils/oauthGrant';
src/screens/Authentication/Verify.tsx:15:import { type DialogHandler, useChromaticDialog } from '../../utils/useChromaticDialog';
src/screens/Authentication/Verify.tsx:33:  setAccessToken: (token: string) => void;
src/screens/Authentication/Verify.tsx:41:  setAccessToken,
src/screens/Authentication/Verify.tsx:78:          const outcome = parseGrantPayload(event, state);
src/screens/Authentication/Verify.tsx:83:          const token = await exchangeOAuthCode(
src/screens/Authentication/Verify.tsx:99:            setAuthenticatedSession(token);
src/screens/Authentication/Verify.tsx:100:            setAccessToken(accessToken.current);
src/screens/Authentication/Verify.tsx:124:          setAuthenticatedSession(authSession.current);
src/screens/Authentication/Verify.tsx:125:          setAccessToken(accessToken.current);
src/screens/Authentication/Verify.tsx:141:      setAccessToken,
src/screens/Authentication/Verify.tsx:146:  const [openDialog, closeDialog] = useChromaticDialog(handler);
src/screens/ShareSection/ShareSection.tsx:7:import { useAccessToken } from '../../utils/graphQLClient';
src/screens/ShareSection/ShareSection.tsx:150:  const [token] = useAccessToken();
src/screens/Authentication/Authentication.tsx:16:  setAccessToken: (token: string | null) => void;
src/screens/Authentication/Authentication.tsx:24:  setAccessToken,
src/screens/Authentication/Authentication.tsx:81:        setAccessToken={setAccessToken}
src/utils/graphQLClient.tsx:8:import { ACCESS_TOKEN_KEY, CHROMATIC_API_URL } from '../env';
src/utils/graphQLClient.tsx:53:    storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(currentAuth));
src/utils/graphQLClient.tsx:55:    storage.removeItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:101:  const storedAuth = storage?.getItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:109:      storage?.removeItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:115:    storage?.removeItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:123:    if (event.key !== ACCESS_TOKEN_KEY) {
src/utils/graphQLClient.tsx:133:        getStorage()?.removeItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:139:      getStorage()?.removeItem(ACCESS_TOKEN_KEY);
src/utils/graphQLClient.tsx:145:export const setAuthenticatedSession = (auth: AuthStorage) => setCurrentAuth(auth);
src/utils/graphQLClient.tsx:147:export const useAccessToken = () => {
src/utils/graphQLClient.tsx:297:export const sessionExpiredEventName = SESSION_EXPIRED_EVENT;
src/screens/ShareSection/useShareAuth.test.ts:10:  const setAuthenticatedSession = vi.fn();
src/screens/ShareSection/useShareAuth.test.ts:11:  const exchangeOAuthCode = vi.fn();
src/screens/ShareSection/useShareAuth.test.ts:17:    setAuthenticatedSession,
src/screens/ShareSection/useShareAuth.test.ts:18:    exchangeOAuthCode,
src/screens/ShareSection/useShareAuth.test.ts:33:  useAccessToken: () => [null, mocks.updateToken],
src/screens/ShareSection/useShareAuth.test.ts:34:  setAuthenticatedSession: mocks.setAuthenticatedSession,
src/screens/ShareSection/useShareAuth.test.ts:39:  return { ...actual, exchangeOAuthCode: mocks.exchangeOAuthCode };
src/screens/ShareSection/useShareAuth.test.ts:46:// Capture the handler registered with useChromaticDialog
src/screens/ShareSection/useShareAuth.test.ts:48:vi.mock('../../utils/useChromaticDialog', () => ({
src/screens/ShareSection/useShareAuth.test.ts:49:  useChromaticDialog: (handler: (event: any) => Promise<void>) => {
src/screens/ShareSection/useShareAuth.test.ts:84:    mocks.exchangeOAuthCode.mockResolvedValueOnce(auth);
src/screens/ShareSection/useShareAuth.test.ts:95:    expect(mocks.exchangeOAuthCode).toHaveBeenCalledOnce();
src/screens/ShareSection/useShareAuth.test.ts:96:    expect(mocks.setAuthenticatedSession).toHaveBeenCalledWith(auth);
src/screens/ShareSection/useShareAuth.test.ts:106:    mocks.exchangeOAuthCode.mockReturnValueOnce(
src/screens/ShareSection/useShareAuth.test.ts:123:    expect(mocks.exchangeOAuthCode).toHaveBeenCalledOnce();
src/screens/ShareSection/useShareAuth.test.ts:142:    mocks.exchangeOAuthCode.mockResolvedValueOnce(createAuthStorage('token'));
src/screens/ShareSection/useShareAuth.test.ts:172:    expect(mocks.exchangeOAuthCode).not.toHaveBeenCalled();
src/screens/ShareSection/useShareAuth.test.ts:186:    expect(mocks.exchangeOAuthCode).not.toHaveBeenCalled();
src/screens/ShareSection/useShareAuth.test.ts:192:    mocks.exchangeOAuthCode.mockRejectedValueOnce(new Error('network error'));
src/TestProviderRender.tsx:29:import { useAccessToken } from './utils/graphQLClient';
src/TestProviderRender.tsx:82:  const [accessToken] = useAccessToken();
src/screens/VisualTests/NoBuild.tsx:46:  const { setAccessToken } = useAuthState();
src/screens/VisualTests/NoBuild.tsx:92:              onClick={() => setAccessToken(null)}
src/screens/VisualTests/NoBuild.tsx:118:                onClick={() => setAccessToken(null)}
src/screens/VisualTests/NoBuild.tsx:146:            <ButtonStackLink isButton onClick={() => setAccessToken(null)} withArrow>
src/screens/VisualTests/SnapshotComparison.stories.tsx:44:    setAccessToken: fn().mockName('setAccessToken'),

exec
/bin/zsh -lc "nl -ba src/screens/LinkProject/LinkProject.tsx | sed -n '150,230p'" in /Users/valentinpalkovic/Projects/addon-visual-tests
 succeeded in 0ms:
   150	  const [isSelectingProject, setSelectingProject] = useSessionState('isSelectingProject', false);
   151	
   152	  const handleSelectProject = useCallback(
   153	    (
   154	      project: NonNullable<
   155	        NonNullable<
   156	          NonNullable<SelectProjectsQueryQuery['viewer']>['accounts'][number]['projects']
   157	        >[number]
   158	      >
   159	    ) => {
   160	      setSelectingProject(true);
   161	      onSelectProjectId(project.id);
   162	      const timer = setTimeout(() => {
   163	        setSelectingProject(false);
   164	      }, 1000);
   165	      return () => clearTimeout(timer);
   166	    },
   167	    [onSelectProjectId, setSelectingProject]
   168	  );
   169	
   170	  const handler = useCallback<DialogHandler>(
   171	    async (event) => {
   172	      if (event.message === 'createdProject') {
   173	        // We don't know the project token yet, so we need to wait until it comes back on the query
   174	        // longer be necessary once we don't write tokens any more
   175	        // (https://linear.app/chromaui/issue/AP-3383/generate-an-app-token-for-each-build-rather-than-writing-project-token)
   176	        rerunProjectsQuery();
   177	        setCreatedProjectId(event.projectId);
   178	      }
   179	    },
   180	    [rerunProjectsQuery, setCreatedProjectId]
   181	  );
   182	
   183	  const [openDialog, closeDialog] = useChromaticDialog(handler);
   184	
   185	  // Once we find the project we created just above, close the dialog and select it
   186	  const createdProject =
   187	    createdProjectId && selectedAccount?.projects?.find((p) => p?.id.endsWith(createdProjectId));
   188	  useEffect(() => {
   189	    if (createdProject) {
   190	      closeDialog();
   191	      handleSelectProject(createdProject);
   192	    }
   193	  }, [createdProject, handleSelectProject, closeDialog]);
   194	
   195	  useTelemetry('LinkProject', 'LinkProject');
   196	
   197	  return (
   198	    <Screen>
   199	      <Container>
   200	        <StyledStack>
   201	          <div>
   202	            <Heading>Select a project</Heading>
   203	            <Text muted>Your tests will sync with this project.</Text>
   204	          </div>
   205	          {error && <p>{error.message}</p>}
   206	          {!data && fetching && (
   207	            <ProjectPicker>
   208	              <Left>
   209	                <ListHeading>Accounts</ListHeading>
   210	                <List>
   211	                  <ListItem appearance="secondary" isLoading />
   212	                  <ListItem appearance="secondary" isLoading />
   213	                  <ListItem appearance="secondary" isLoading />
   214	                  <ListItem appearance="secondary" isLoading />
   215	                  <ListItem appearance="secondary" isLoading />
   216	                </List>
   217	              </Left>
   218	              <Right>
   219	                <ListHeading>Projects</ListHeading>
   220	                <List data-testid="right-list">
   221	                  <ListItem appearance="secondary" isLoading />
   222	                  <ListItem appearance="secondary" isLoading />
   223	                  <ListItem appearance="secondary" isLoading />
   224	                </List>
   225	              </Right>
   226	            </ProjectPicker>
   227	          )}
   228	          {data?.viewer?.accounts && (
   229	            <ProjectPicker>
   230	              <Left>

codex
1. Bugs/risks

- **Medium** [src/screens/Authentication/Verify.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/screens/Authentication/Verify.tsx:91): `getFetchOptions(token.accessToken)` runs before `setAuthenticatedSession(token)`, so [graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:170) sends the fallback session id, not the OAuth `sessionId`. If Chromatic correlates token/session headers, the initial project query can fail or be misattributed.
- **Medium** [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:227): retrying `refresh_token` after `AbortError`/5xx can be unsafe with rotating refresh tokens. If the first request reached the server and rotated the token but the response was lost, the retry may reuse an invalidated token and kill the session.
- **Low** [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:90): legacy raw JWT storage is deleted with no migration. Existing users will be forced to re-auth after upgrade. Maybe acceptable, but should be explicit.
- **Low** [eslint.config.mjs](/Users/valentinpalkovic/Projects/addon-visual-tests/eslint.config.mjs:82): HTML-sink bans miss computed/template forms like `el['innerHTML'] = x` and `setTimeout(\`${x}\`)`. Good guardrail, not a complete hardening boundary.

2. Simplifications

- [src/screens/Authentication/Verify.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/screens/Authentication/Verify.tsx:60): drop `accessToken` ref. `authSession.current?.accessToken` is the same state; two refs create impossible states and extra error branches.
- [src/utils/requestAccessToken.ts](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/requestAccessToken.ts:9): drop `clientId` from `TokenExchangeParameters`; it is always `OAUTH_CLIENT_ID`.
- [src/utils/requestAccessToken.ts](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/requestAccessToken.ts:16): consider dropping persisted `tokenEndpoint`; derive it from validated `subdomain` for both exchange and refresh.
- [src/utils/graphQLClient.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/utils/graphQLClient.tsx:81): remove the “token before full auth state” branch if all real sign-in paths now call `setAuthenticatedSession` first.
- [src/Panel.tsx](/Users/valentinpalkovic/Projects/addon-visual-tests/src/Panel.tsx:49): `PanelProps.api` and the `API` import are now dead; remove them.

3. Architecture concerns

Auth state is now spread across module globals, `localStorage`, Storybook addon state, token subscribers, storage events, and a custom window event. That is a lot of coordination for one session object. A small auth-store abstraction with `get/set/clear/subscribe/refresh` would make races and tests easier to reason about.

Storing refresh tokens in `localStorage` increases XSS blast radius. The lint bans help, but they do not make browser storage a secure token boundary.
2026-05-07T14:01:10.000620Z ERROR codex_core::session: failed to record rollout items: thread 019e02ba-6cd2-7cc0-bc29-fe39192c1535 not found
tokens used
66.516
2026-05-07T14:01:10.023363Z ERROR rmcp::transport::streamable_http_client: fail to delete session: unexpected server response: DELETE returned HTTP 404 session_id="4a1ba17b-7d45-4ce6-8bdb-57baedf586a6"

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
