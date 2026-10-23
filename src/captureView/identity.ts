const USER_AGENT_SUFFIX = ' (Chromatic capture)';
const URL_PARAM = 'chromatic';

// Only remove the URL param if we added it, so we don't break a manually set `chromatic=true`
let addedUrlParam = false;

/**
 * Make `isChromatic()` return true (or false again), by mimicking what the Chromatic capture
 * browser looks like: its user agent is suffixed with "(Chromatic capture)". We also set
 * `chromatic=true` in the URL, which `isChromatic()` checks as well.
 *
 * Code that reads the user agent before this runs (e.g. at module load time) is not affected.
 */
export const setChromaticIdentity = (enabled: boolean, win: Window = window) => {
  const { navigator, history, location } = win;
  const hasOverride = Object.prototype.hasOwnProperty.call(navigator, 'userAgent');

  if (enabled && !hasOverride) {
    const userAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => userAgent + USER_AGENT_SUFFIX,
    });
  } else if (!enabled && hasOverride) {
    // Removing the own property exposes the original getter on the prototype again
    delete (navigator as { userAgent?: string }).userAgent;
  }

  const url = new URL(location.href);
  const hasParam = url.searchParams.get(URL_PARAM) === 'true';
  if (enabled && !hasParam) {
    url.searchParams.set(URL_PARAM, 'true');
    history.replaceState(history.state, '', url);
    addedUrlParam = true;
  } else if (!enabled && hasParam && addedUrlParam) {
    url.searchParams.delete(URL_PARAM);
    history.replaceState(history.state, '', url);
    addedUrlParam = false;
  }
};
