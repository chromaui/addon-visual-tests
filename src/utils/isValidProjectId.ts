// Mongo ObjectId: 24 hex chars. Matches what the public API passes to `new ObjectId(...)`
// after stripping an optional `Project:` prefix.
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

export const stripProjectIdPrefix = (projectId: string) => projectId.replace(/^Project:/, '');

export const isValidProjectId = (projectId: string) =>
  OBJECT_ID_RE.test(stripProjectIdPrefix(projectId));

// Project tokens look like `chpt_…` — a common misconfig is pasting one into `projectId`.
export const isProjectTokenAsProjectId = (projectId: string) =>
  stripProjectIdPrefix(projectId).startsWith('chpt_');
