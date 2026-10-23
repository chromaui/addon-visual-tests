export const EMULATOR_PARTS = [
  /** Viewport size, mode globals and masking of everything outside the captured region */
  'viewport',
  /** Frozen animations, hidden carets and spellcheck markers, capture text rendering */
  'rendering',
  /** `isChromatic()` returns true */
  'identity',
] as const;

export type EmulatorPart = (typeof EMULATOR_PARTS)[number];

export type EmulatorSettings = Record<EmulatorPart, boolean>;

export const DEFAULT_EMULATOR_SETTINGS: EmulatorSettings = {
  viewport: false,
  rendering: false,
  identity: false,
};

/**
 * Normalize the value of the Chromatic emulator global. The global is an object with a flag for
 * each part, but we also accept a plain boolean (e.g. `chromaticEmulator:!true` in the URL) to
 * turn every part on or off.
 */
export const getEmulatorSettings = (value: unknown): EmulatorSettings => {
  if (typeof value === 'boolean') {
    return { viewport: value, rendering: value, identity: value };
  }
  if (!value || typeof value !== 'object') {
    return DEFAULT_EMULATOR_SETTINGS;
  }
  const settings = { ...DEFAULT_EMULATOR_SETTINGS };
  for (const part of EMULATOR_PARTS) {
    const flag = (value as Record<string, unknown>)[part];
    if (typeof flag === 'boolean') settings[part] = flag;
  }
  return settings;
};

/** The emulator is active when any of its parts is turned on. */
export const isEmulatorActive = (settings: EmulatorSettings) =>
  EMULATOR_PARTS.some((part) => settings[part]);
