import { ADDON_ID } from './constants';

export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || 'https://www.chromatic.com',
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

// Per-Storybook identifier injected by the addon's `managerHead` preset hook.
// Falls back to 'unscoped' when missing (e.g. preset didn't run, no git remote).
const STORYBOOK_ID =
  (typeof window !== 'undefined' &&
    (window as { __CHROMATIC_STORYBOOK_ID__?: string }).__CHROMATIC_STORYBOOK_ID__) ||
  'unscoped';

export const ACCESS_TOKEN_KEY_LEGACY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const ACCESS_TOKEN_KEY = `${ACCESS_TOKEN_KEY_LEGACY}/${STORYBOOK_ID}`;
