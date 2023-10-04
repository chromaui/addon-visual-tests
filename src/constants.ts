export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || "https://www.chromatic.com",
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const ADDON_ID = "chromaui/addon-visual-tests";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const SIDEBAR_TOP_ID = `${ADDON_ID}/sidebarTop`;
export const SIDEBAR_BOTTOM_ID = `${ADDON_ID}/sidebarBottom`;
export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const DEV_BUILD_ID_KEY = `${ADDON_ID}/dev-build-id`;

export const GIT_INFO = `${ADDON_ID}/gitInfo`;
export const GIT_INFO_ERROR = `${ADDON_ID}/gitInfoError`;
export const PROJECT_INFO = `${ADDON_ID}/projectInfo`;
export const IS_OUTDATED = `${ADDON_ID}/isOutdated`;
export const START_BUILD = `${ADDON_ID}/startBuild`;
export const LOCAL_BUILD_PROGRESS = `${ADDON_ID}/localBuildProgress`;
