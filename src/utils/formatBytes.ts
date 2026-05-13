export type FormatBytesObject = {
  value: number;
  symbol: string;
  exponent: number;
};

const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function formatBytesObject(
  bytes: number,
  options?: { exponent?: number; round?: number }
): FormatBytesObject {
  const round = options?.round ?? 1;

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return { value: 0, symbol: UNITS[0], exponent: 0 };
  }

  const computedExp = Math.min(UNITS.length - 1, Math.max(0, Math.floor(Math.log10(bytes) / 3)));
  const exp = Math.min(UNITS.length - 1, Math.max(0, options?.exponent ?? computedExp));

  const value = bytes / Math.pow(1000, exp);
  const factor = Math.pow(10, round);
  const rounded = Math.round(value * factor) / factor;
  const shouldPromoteUnit =
    options?.exponent === undefined && rounded >= 1000 && exp < UNITS.length - 1;
  const finalExp = shouldPromoteUnit ? exp + 1 : exp;
  const finalValue = shouldPromoteUnit
    ? Math.round((bytes / Math.pow(1000, finalExp)) * factor) / factor
    : rounded;

  return { value: finalValue, symbol: UNITS[finalExp], exponent: finalExp };
}
