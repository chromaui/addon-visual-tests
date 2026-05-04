import { ADDON_ID } from './constants';

export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || 'https://www.chromatic.com',
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
