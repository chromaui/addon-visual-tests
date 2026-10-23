export const EMULATOR_PARTS = [
  'viewport',
  'animations',
  'carets',
  'rendering',
  'identity',
  'mask',
] as const;

export type EmulatorPart = (typeof EMULATOR_PARTS)[number];

export type EmulatorSettings = { enabled: boolean } & Record<EmulatorPart, boolean>;

export const DEFAULT_EMULATOR_SETTINGS: EmulatorSettings = {
  enabled: false,
  viewport: true,
  animations: true,
  carets: true,
  rendering: true,
  identity: true,
  mask: true,
};

/**
 * Normalize the value of the Chromatic emulator global. The global is an object with an `enabled` flag
 * and a flag for each part, but we also accept a plain boolean (e.g. `chromaticEmulator:!true` in
 * the URL) to enable or disable it with every part on.
 */
export const getEmulatorSettings = (value: unknown): EmulatorSettings => {
  if (typeof value === 'boolean') {
    return { ...DEFAULT_EMULATOR_SETTINGS, enabled: value };
  }
  if (!value || typeof value !== 'object') {
    return DEFAULT_EMULATOR_SETTINGS;
  }
  const settings = { ...DEFAULT_EMULATOR_SETTINGS };
  for (const key of ['enabled', ...EMULATOR_PARTS] as const) {
    const flag = (value as Record<string, unknown>)[key];
    if (typeof flag === 'boolean') settings[key] = flag;
  }
  return settings;
};
