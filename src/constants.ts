export const { CHROMATIC_BASE_URL } = process.env;

export const ADDON_ID = "chromaui/storybook-visual-tests";
export const TOOL_ID = `${ADDON_ID}/tool`;
export const PANEL_ID = `${ADDON_ID}/panel`;
export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const DEV_BUILD_ID_KEY = `${ADDON_ID}/dev-build-id`;

export const PROJECT_PARAM_KEY = "projectId";

export const START_BUILD = `${ADDON_ID}/startBuild`;
export const BUILD_STARTED = `${ADDON_ID}/buildStarted`;

export const UPDATE_PROJECT = `${ADDON_ID}/updateProject`;
export const PROJECT_UPDATED = `${ADDON_ID}/projectUpdated`;