export const ADDON_ID = "chromaui/storybook-visual-tests";
export const TOOL_ID = `${ADDON_ID}/tool`;
export const PANEL_ID = `${ADDON_ID}/panel`;
export const STORAGE_KEY = `${ADDON_ID}/access-token`;

export const { CHROMATIC_BASE_URL } = process.env;

export const START_BUILD = `${ADDON_ID}/startBuild`;
export const BUILD_STARTED = `${ADDON_ID}/buildStarted`;

export const BuildStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  PASSED: "PASSED",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DENIED: "DENIED",
  BROKEN: "BROKEN",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export const TestStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  PASSED: "PASSED",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DENIED: "DENIED",
  BROKEN: "BROKEN",
  FAILED: "FAILED",
} as const;

export const ComparisonResult = {
  EQUAL: "EQUAL",
  FIXED: "FIXED",
  ADDED: "ADDED",
  CHANGED: "CHANGED",
  REMOVED: "REMOVED",
  CAPTURE_ERROR: "CAPTURE_ERROR",
  SYSTEM_ERROR: "SYSTEM_ERROR",
} as const;

export const aggregate = <T extends keyof typeof TestStatus | keyof typeof ComparisonResult>([
  first,
  ...rest
]: T[]) => {
  const order = Object.values(first in TestStatus ? TestStatus : ComparisonResult);
  return rest.reduce((acc, v) => (order.indexOf(v) > order.indexOf(acc) ? v : acc), first);
};
