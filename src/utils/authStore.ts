import { v4 as uuid } from 'uuid';

import { ADDON_ID } from '../constants';
import { ACCESS_TOKEN_KEY } from '../env';
import { type AuthSession, AuthSessionSchema, refreshAccessToken } from './requestAccessToken';

const REFRESH_TIMEOUT_MS = 10_000;
const SESSION_EXPIRED_EVENT = `${ADDON_ID}/session-expired`;

const setBrowserTimeout = (...args: Parameters<typeof globalThis.setTimeout>) =>
  (typeof window !== 'undefined' ? window : globalThis).setTimeout(...args);
const clearBrowserTimeout = (...args: Parameters<typeof globalThis.clearTimeout>) =>
  (typeof window !== 'undefined' ? window : globalThis).clearTimeout(...args);

type Subscriber = (token: string | null) => void;

const parseStoredAuth = (rawAuth: string): AuthSession | null => {
  // Legacy format used to persist only a raw JWT string.
  if (!rawAuth.trim().startsWith('{')) {
    return null;
  }
  const parsed = AuthSessionSchema.safeParse(JSON.parse(rawAuth));
  return parsed.success ? parsed.data : null;
};

class AuthStore {
  private auth: AuthSession | null = null;
  private generation = 0;
  private refreshing: Promise<void> | null = null;
  private refreshAbort: AbortController | null = null;
  private readonly subscribers = new Set<Subscriber>();
  private readonly fallbackSessionId = uuid();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  private get storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  private notifySubscribers() {
    const token = this.getToken();
    this.subscribers.forEach((cb) => cb(token));
  }

  private notifySessionExpired() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new window.CustomEvent(SESSION_EXPIRED_EVENT));
  }

  private persist() {
    const storage = this.storage;
    if (!storage) return;
    if (this.auth) storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(this.auth));
    else storage.removeItem(ACCESS_TOKEN_KEY);
  }

  private applyParsedAuth(rawAuth: string | null) {
    if (!rawAuth) {
      this.setAuth(null, { persist: false });
      return;
    }
    try {
      const parsed = parseStoredAuth(rawAuth);
      if (!parsed) {
        this.storage?.removeItem(ACCESS_TOKEN_KEY);
        this.setAuth(null, { persist: false });
        return;
      }
      this.setAuth(parsed, { persist: false });
    } catch {
      this.storage?.removeItem(ACCESS_TOKEN_KEY);
      this.setAuth(null, { persist: false });
    }
  }

  private loadFromStorage() {
    this.applyParsedAuth(this.storage?.getItem(ACCESS_TOKEN_KEY) ?? null);
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== ACCESS_TOKEN_KEY) return;
    this.applyParsedAuth(event.newValue);
  };

  private async attemptRefresh() {
    const auth = this.auth;
    if (!auth) {
      throw new Error('Token refresh failed (401)');
    }
    const generation = this.generation;
    const abortController = new AbortController();
    this.refreshAbort = abortController;
    const timeoutId = setBrowserTimeout(() => abortController.abort(), REFRESH_TIMEOUT_MS);
    try {
      const nextAuth = await refreshAccessToken({
        subdomain: auth.subdomain,
        refreshToken: auth.refreshToken,
        sessionId: auth.sessionId,
        signal: abortController.signal,
      });
      if (generation !== this.generation) return;
      this.setAuth(nextAuth);
    } finally {
      clearBrowserTimeout(timeoutId);
      this.refreshAbort = null;
    }
  }

  getAuth() {
    return this.auth;
  }

  getToken() {
    return this.auth?.accessToken ?? null;
  }

  getSessionId() {
    return this.auth?.sessionId || this.fallbackSessionId;
  }

  setAuth(auth: AuthSession | null, { persist = true }: { persist?: boolean } = {}) {
    this.auth = auth;
    if (persist) this.persist();
    this.notifySubscribers();
  }

  setToken(token: string | null) {
    if (!token) {
      this.clear();
      return;
    }
    if (this.auth) this.setAuth({ ...this.auth, accessToken: token });
  }

  clear() {
    this.generation += 1;
    this.refreshAbort?.abort();
    this.refreshAbort = null;
    this.refreshing = null;
    this.setAuth(null);
  }

  subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  async refresh() {
    if (!this.auth) {
      this.clear();
      return;
    }
    if (!this.refreshing) {
      this.refreshing = this.attemptRefresh()
        .catch((error) => {
          console.warn('Session expired. Please sign in again.');
          this.clear();
          this.notifySessionExpired();
          throw error;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }
    await this.refreshing;
  }
}

export const authStore = new AuthStore();
export const SESSION_EXPIRED_EVENT_NAME = SESSION_EXPIRED_EVENT;
