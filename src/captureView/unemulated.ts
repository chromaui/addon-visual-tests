import type { ChromaticParameters } from '../types';

type ChromaticConfig = NonNullable<ChromaticParameters['chromatic']> & { colorScheme?: string };

/**
 * List the capture settings in effect for a story and mode which affect the snapshot, but which
 * can't be reproduced from within the page (they're set on the browser running the capture).
 */
export const getUnemulatedFeatures = (
  chromatic: ChromaticConfig = {},
  modeGlobals: Record<string, unknown> = {}
): string[] => {
  const features: string[] = [];
  const colorScheme = modeGlobals.colorScheme ?? chromatic.colorScheme;
  if (colorScheme) features.push(`color scheme: ${colorScheme}`);
  if (chromatic.prefersReducedMotion) {
    features.push(`prefers-reduced-motion: ${chromatic.prefersReducedMotion}`);
  }
  if (chromatic.forcedColors) features.push(`forced-colors: ${chromatic.forcedColors}`);
  if (chromatic.media) features.push(`media: ${chromatic.media}`);
  if (modeGlobals.locale) features.push(`browser locale: ${modeGlobals.locale}`);
  if (modeGlobals.hasTouch) features.push('touch support');
  return features;
};
