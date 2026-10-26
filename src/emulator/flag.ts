/**
 * The Chromatic emulator is experimental and disabled by default. It's enabled with the
 * `experimental_emulator` addon option, which the preset exposes to the manager and preview as a
 * global flag.
 */
export const EMULATOR_FLAG = '__CHROMATIC_EMULATOR__';

export const isEmulatorEnabled = () => !!(globalThis as Record<string, unknown>)[EMULATOR_FLAG];

export const getEmulatorFlagScript = () => `<script>window.${EMULATOR_FLAG} = true;</script>`;
