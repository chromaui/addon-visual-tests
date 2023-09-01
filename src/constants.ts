import type { GitInfo } from "chromatic/node";

export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || "https://www.chromatic.com",
  CHROMATIC_ADDON_NAME = "@chromaui/addon-visual-tests",
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const ADDON_ID = "chromaui/addon-visual-tests";
export const TOOL_ID = `${ADDON_ID}/tool`;
export const PANEL_ID = `${ADDON_ID}/panel`;
export const SIDEBAR_BOTTOM_ID = `${ADDON_ID}/sidebarBottom`;
export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const DEV_BUILD_ID_KEY = `${ADDON_ID}/dev-build-id`;

export const GIT_INFO = `${ADDON_ID}/gitInfo`;
export type GitInfoPayload = Omit<GitInfo, "committedAt" | "committerEmail" | "committerName">;

export const PROJECT_INFO = `${ADDON_ID}/projectInfo`;
export type ProjectInfoPayload = {
  projectId?: string;
  projectToken?: string;
  written?: boolean;
  configDir?: string;
  mainPath?: string;
};

export const START_BUILD = `${ADDON_ID}/startBuild`;
export const BUILD_ANNOUNCED = `${ADDON_ID}/buildAnnounced`;
export const BUILD_STARTED = `${ADDON_ID}/buildStarted`;
