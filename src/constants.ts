import type { GitInfo, TaskName } from "chromatic/node";

export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || "https://www.chromatic.com",
  CHROMATIC_ADDON_NAME = "@chromaui/addon-visual-tests",
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const ADDON_ID = "chromaui/addon-visual-tests";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const SIDEBAR_TOP_ID = `${ADDON_ID}/sidebarTop`;
export const SIDEBAR_BOTTOM_ID = `${ADDON_ID}/sidebarBottom`;
export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const DEV_BUILD_ID_KEY = `${ADDON_ID}/dev-build-id`;

export const GIT_INFO = `${ADDON_ID}/gitInfo`;
export type GitInfoPayload = Omit<GitInfo, "committerEmail" | "committerName">;

export const PROJECT_INFO = `${ADDON_ID}/projectInfo`;
export type ProjectInfoPayload = {
  projectId?: string;
  projectToken?: string;
  written?: boolean;
  configDir?: string;
  mainPath?: string;
};

// The CLI may have other steps that we don't respond to, so we just ignore updates
// to those steps and focus on the ones we know.
type KnownStep = Extract<TaskName, "initialize" | "build" | "upload" | "verify" | "snapshot">;
export const knownSteps = ["initialize", "build", "upload", "verify", "snapshot"];
export const isKnownStep = (task: TaskName): task is KnownStep => knownSteps.includes(task);

export const START_BUILD = `${ADDON_ID}/startBuild`;
export const RUNNING_BUILD = `${ADDON_ID}/runningBuild`;
export type RunningBuildPayload = {
  /** The id of the build, available after the initialize step */
  buildId?: string;

  /** Overall percentage of build progress */
  buildProgressPercentage?: number;

  // Possibly this should be a type exported by the CLI -- these correspond to tasks
  /** The step of the build process we have reached */
  step: KnownStep | "error" | "complete";

  /** Current task progress value (e.g. bytes or snapshots) */
  stepProgressValue?: number;

  /** Current task progress total (e.g. bytes or snapshots)  */
  stepProgressTotal?: number;

  /** Number of visual changes detected */
  changeCount?: number;

  /** Number of component errors detected */
  errorCount?: number;

  /** The error message formatted to display in CLI */
  formattedError?: string;

  /** The original error without formatting */
  originalError?: Error | Error[];
};
