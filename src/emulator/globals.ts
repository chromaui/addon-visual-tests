type Globals = Record<string, unknown>;

// Globals are serializable values, so a structural comparison of plain data is sufficient.
const isEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return (
    keysA.length === keysB.length &&
    keysA.every((key) => isEqual((a as Globals)[key], (b as Globals)[key]))
  );
};

/**
 * Compute the globals update needed to move from the current globals to the target globals, while
 * keeping track of the original value of every global we override so it can be restored later.
 *
 * Globals we overrode previously but which aren't part of the target are restored. Globals set
 * by the story itself can't be changed and are skipped.
 *
 * @returns The globals update to apply (empty when nothing needs to change), and the new set of
 * original values to restore once the Chromatic emulator is turned off.
 */
export const getGlobalsUpdate = ({
  current,
  target,
  saved,
  locked = {},
}: {
  current: Globals;
  target: Globals;
  saved: Globals;
  locked?: Globals;
}) => {
  const update: Globals = {};
  const nextSaved: Globals = {};

  for (const [key, original] of Object.entries(saved)) {
    if (key in target) nextSaved[key] = original;
    else if (!isEqual(current[key], original)) update[key] = original;
  }

  for (const [key, value] of Object.entries(target)) {
    if (key in locked) continue;
    if (!(key in nextSaved)) nextSaved[key] = current[key];
    if (!isEqual(current[key], value)) update[key] = value;
  }

  return { update, saved: nextSaved };
};
