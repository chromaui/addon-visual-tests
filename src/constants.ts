export const {
  CHROMATIC_INDEX_URL,
  CHROMATIC_BASE_URL = CHROMATIC_INDEX_URL || 'https://www.chromatic.com',
  CHROMATIC_API_URL = `${CHROMATIC_BASE_URL}/api`,
} = process.env;

export const PACKAGE_NAME = '@chromatic-com/storybook';

export const ADDON_ID = 'chromaui/addon-visual-tests';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const TEST_PROVIDER_ID = `${ADDON_ID}/test-provider`;
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
export const PARAM_KEY = 'chromatic';

export const FETCH_ABORTED = `${ADDON_ID}/ChannelFetch/aborted`;
export const FETCH_REQUEST = `${ADDON_ID}ChannelFetch/request`;
export const FETCH_RESPONSE = `${ADDON_ID}ChannelFetch/response`;

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
  // Prefix for Chromatic CLI log messages
  logPrefix: '\x1b[38;5;202mChromatic\x1B[0m:',
  // Never skip local builds
  skip: false,
  // Don't check for CLI updates
  skipUpdateCheck: true,
  // VTA doesn't support "manual" Storybook builds
  storybookBuildDir: undefined,
};

export const DOCS_URL = 'https://www.chromatic.com/docs/visual-tests-addon';
