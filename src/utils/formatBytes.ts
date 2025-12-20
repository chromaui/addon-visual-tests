export type FormatBytesObject = {
  value: number;
  symbol: string;
  exponent: number;
};

export function formatBytesObject(
  bytes: number,
  options?: { exponent?: number; round?: number }
): FormatBytesObject {
  const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const round = options?.round ?? 1;

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return { value: 0, symbol: UNITS[0], exponent: 0 };
  }

  const computedExp = Math.min(UNITS.length - 1, Math.max(0, Math.floor(Math.log10(bytes) / 3)));
  const exp = Math.min(UNITS.length - 1, Math.max(0, options?.exponent ?? computedExp));

  const value = bytes / Math.pow(1000, exp);
  const factor = Math.pow(10, round);
  const rounded = Math.round(value * factor) / factor;

  return { value: rounded, symbol: UNITS[exp], exponent: exp };
}
