export const CAPTURE_VIEW_PARTS = [
  'viewport',
  'animations',
  'carets',
  'rendering',
  'identity',
  'mask',
] as const;

export type CaptureViewPart = (typeof CAPTURE_VIEW_PARTS)[number];

export type CaptureViewSettings = { enabled: boolean } & Record<CaptureViewPart, boolean>;

export const DEFAULT_CAPTURE_VIEW_SETTINGS: CaptureViewSettings = {
  enabled: false,
  viewport: true,
  animations: true,
  carets: true,
  rendering: true,
  identity: true,
  mask: true,
};

/**
 * Normalize the value of the capture view global. The global is an object with an `enabled` flag
 * and a flag for each part, but we also accept a plain boolean (e.g. `chromaticCapture:!true` in
 * the URL) to enable or disable it with every part on.
 */
export const getCaptureViewSettings = (value: unknown): CaptureViewSettings => {
  if (typeof value === 'boolean') {
    return { ...DEFAULT_CAPTURE_VIEW_SETTINGS, enabled: value };
  }
  if (!value || typeof value !== 'object') {
    return DEFAULT_CAPTURE_VIEW_SETTINGS;
  }
  const settings = { ...DEFAULT_CAPTURE_VIEW_SETTINGS };
  for (const key of ['enabled', ...CAPTURE_VIEW_PARTS] as const) {
    const flag = (value as Record<string, unknown>)[key];
    if (typeof flag === 'boolean') settings[key] = flag;
  }
  return settings;
};
