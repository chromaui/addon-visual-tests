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

export const START_BUILD = `${ADDON_ID}/startBuild`;
export const BUILD_PROGRESS = `${ADDON_ID}/buildProgress`;
export type BuildProgressPayload = {
  // Possibly this should be a type exported by the CLI -- these correspond to tasks
  /** The step of the build process we have reached */
  step: "initialize" | "build" | "upload" | "verify" | "snapshot" | "complete";
  /** The id of the build, available after the initialize step */
  id?: string;
  /** progress pertains to the current step, and may not be set */
  progress?: number;
  /** total pertains to the current step, and may not be set */
  total?: number;
};

export const UPDATE_PROJECT = `${ADDON_ID}/updateProject`;
export type UpdateProjectPayload = {
  projectId: string;
  projectToken: string;
};

export const PROJECT_UPDATED = `${ADDON_ID}/projectUpdated`;
