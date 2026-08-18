import { CONFIG_OVERRIDES } from '../constants.ts';

type ChromaticNode = typeof import('chromatic/node');

let modulePromise: Promise<ChromaticNode> | undefined;

/**
 * `chromatic/node` bundles the entire Chromatic CLI, which takes hundreds of milliseconds of
 * module evaluation. Storybook applies this preset during every dev server and CLI bootstrap, so
 * the module is imported lazily: loading the preset stays cheap, and only actually using
 * Chromatic — running a build, sharing, reading git or configuration info — pays for the CLI.
 */
export function importChromaticNode(): Promise<ChromaticNode> {
  return (modulePromise ??= import('chromatic/node'));
}

let logger: ReturnType<ChromaticNode['createLogger']> | undefined;

/** The addon-wide Chromatic logger, created on first use. */
export async function getChromaticLogger() {
  return (logger ??= (await importChromaticNode()).createLogger(undefined, CONFIG_OVERRIDES));
}

export const getConfiguration: ChromaticNode['getConfiguration'] = async (...args) =>
  (await importChromaticNode()).getConfiguration(...args);

export const getGitInfo: ChromaticNode['getGitInfo'] = async (...args) =>
  (await importChromaticNode()).getGitInfo(...args);

export const share: ChromaticNode['share'] = async (...args) =>
  (await importChromaticNode()).share(...args);
