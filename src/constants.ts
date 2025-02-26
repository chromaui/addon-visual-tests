// eslint-disable-next-line import/namespace
import * as coreEvents from "storybook/internal/core-events";

export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || "https://www.chromatic.com",
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const PACKAGE_NAME = "@chromatic-com/storybook";

export const ADDON_ID = "chromaui/addon-visual-tests";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const TEST_PROVIDER_ID = `${ADDON_ID}/test-provider`;
export const SIDEBAR_TOP_ID = `${ADDON_ID}/sidebarTop`;
export const SIDEBAR_BOTTOM_ID = `${ADDON_ID}/sidebarBottom`;
export const ACCESS_TOKEN_KEY = `${ADDON_ID}/access-token/${CHROMATIC_BASE_URL}`;
export const DEV_BUILD_ID_KEY = `${ADDON_ID}/dev-build-id`;
export const CONFIG_INFO = `${ADDON_ID}/configInfo`;
export const CONFIG_INFO_DISMISSED = `${ADDON_ID}/configInfoDismissed`;
export const GIT_INFO = `${ADDON_ID}/gitInfo`;
export const GIT_INFO_ERROR = `${ADDON_ID}/gitInfoError`;
export const PROJECT_INFO = `${ADDON_ID}/projectInfo`;
export const IS_OFFLINE = `${ADDON_ID}/isOffline`;
export const IS_OUTDATED = `${ADDON_ID}/isOutdated`;
export const START_BUILD = `${ADDON_ID}/startBuild`;
export const STOP_BUILD = `${ADDON_ID}/stopBuild`;
export const LOCAL_BUILD_PROGRESS = `${ADDON_ID}/localBuildProgress`;
export const SELECTED_MODE_NAME = `${ADDON_ID}/selectedModeName`;
export const SELECTED_BROWSER_ID = `${ADDON_ID}/selectedBrowserId`;
export const TELEMETRY = `${ADDON_ID}/telemetry`;
export const ENABLE_FILTER = `${ADDON_ID}/enableFilter`;
export const REMOVE_ADDON = `${ADDON_ID}/removeAddon`;
export const PARAM_KEY = "chromatic";

export const FETCH_ABORTED = `${ADDON_ID}/ChannelFetch/aborted`;
export const FETCH_REQUEST = `${ADDON_ID}ChannelFetch/request`;
export const FETCH_RESPONSE = `${ADDON_ID}ChannelFetch/response`;

// Not available in older versions of @storybook/core-events
export const {
  TESTING_MODULE_CRASH_REPORT = "testingModuleCrashReport",
  TESTING_MODULE_PROGRESS_REPORT = "testingModuleProgressReport",
  TESTING_MODULE_RUN_REQUEST = "testingModuleRunRequest",
  TESTING_MODULE_RUN_ALL_REQUEST = "testingModuleRunAllRequest",
  TESTING_MODULE_CANCEL_TEST_RUN_REQUEST = "testingModuleCancelTestRunRequest",
  TESTING_MODULE_CANCEL_TEST_RUN_RESPONSE = "testingModuleCancelTestRunResponse",
  TESTING_MODULE_WATCH_MODE_REQUEST = "testingModuleWatchModeRequest",
} = coreEvents as any;

export const CONFIG_OVERRIDES = {
  // Local changes should never be auto-accepted
  autoAcceptChanges: false,
  // Test results must be awaited to get progress updates
  exitOnceUploaded: false,
  // Don't raise any alarms when changes are found
  exitZeroOnChanges: true,
  // We might want to drop this later and instead record "uncommitted hashes" on builds
  forceRebuild: true,
  // This should never be set for local builds
  fromCI: false,
  // No prompts from the Build proces
  interactive: false,
  // Builds initiated from the addon are always considered local
  isLocalBuild: true,
  // Never skip local builds
  skip: false,
  // Don't check for CLI updates
  skipUpdateCheck: true,
  // VTA doesn't support "manual" Storybook builds
  storybookBuildDir: undefined,
};

export const DOCS_URL = "https://www.chromatic.com/docs/visual-tests-addon";
