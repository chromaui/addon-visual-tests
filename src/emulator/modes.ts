import type { ChromaticParameters } from '../types';

type ChromaticConfig = NonNullable<ChromaticParameters['chromatic']>;

type ViewportDefinition = { styles?: { width?: string | number; height?: string | number } };
type ViewportMap = Record<string, ViewportDefinition>;

export type ViewportParameters = {
  /** Storybook 9+ */
  options?: ViewportMap;
  /** Storybook 8 and earlier */
  viewports?: ViewportMap;
};

export interface CaptureMode {
  /** Mode name, matching the mode name of tests in a Chromatic build */
  name: string;
  /** Globals to apply for this mode, excluding `viewport` */
  globals: Record<string, unknown>;
  /** Viewport width in CSS pixels */
  width: number;
  /** Viewport height in CSS pixels */
  height: number;
  /** Whether this is Chromatic's default mode, used when a story doesn't define any modes */
  isDefault?: boolean;
}

export const DEFAULT_VIEWPORT_WIDTH = 1200;
export const DEFAULT_VIEWPORT_HEIGHT = 900;
export const MIN_VIEWPORT_SIZE = 200;
export const MAX_VIEWPORT_SIZE = 2560;

// Storybook's default viewports, used when the project doesn't define any of its own.
// `responsive` maps to Chromatic's default viewport width.
const DEFAULT_VIEWPORTS: ViewportMap = {
  responsive: { styles: { width: `${DEFAULT_VIEWPORT_WIDTH}` } },
  mobile1: { styles: { width: '320', height: '568' } },
  mobile2: { styles: { width: '414', height: '896' } },
  tablet: { styles: { width: '834', height: '1112' } },
};

const clamp = (value: number) => Math.min(MAX_VIEWPORT_SIZE, Math.max(MIN_VIEWPORT_SIZE, value));

/** Parse a viewport dimension, which must be a whole number of pixels (`375` or `'375px'`). */
const parseDimension = (value: unknown) => {
  const match = value?.toString().match(/^(\d+)(px)?$/);
  return match ? Number.parseInt(match[1], 10) : undefined;
};

/**
 * Resolve a viewport reference to concrete dimensions. The reference may be the name of a
 * configured viewport, an object with `width` and/or `height`, or a plain width.
 */
const resolveViewport = (viewports: ViewportMap, reference: unknown, isRotated = false) => {
  if (!reference) return undefined;

  let width: unknown;
  let height: unknown;
  const named = viewports[reference.toString()];
  if (named) {
    width = named.styles?.width;
    height = named.styles?.height;
    if (isRotated) [width, height] = [height, width];
  } else if (typeof reference === 'object') {
    ({ width, height } = reference as { width?: unknown; height?: unknown });
  } else {
    width = reference;
  }

  const size = { width: parseDimension(width), height: parseDimension(height) };
  return size.width || size.height ? size : undefined;
};

const toCaptureMode = (
  name: string,
  globals: Record<string, unknown>,
  size: { width?: number; height?: number } = {}
): CaptureMode => ({
  name,
  globals,
  width: clamp(size.width || DEFAULT_VIEWPORT_WIDTH),
  height: clamp(size.height || DEFAULT_VIEWPORT_HEIGHT),
});

const fromModes = (modes: NonNullable<ChromaticConfig['modes']>, viewports: ViewportMap) =>
  Object.entries(modes).flatMap(([name, mode]) => {
    if (!mode || typeof mode !== 'object' || Array.isArray(mode)) return [];
    const { disable, disabled, viewport, ...globals } = mode as Record<string, unknown>;
    if (disable === true || disabled === true) return [];

    // Storybook 9+ viewport globals look like `{ value: 'mobile1', isRotated: true }`
    const { value, isRotated } = (viewport ?? {}) as { value?: unknown; isRotated?: boolean };
    const size = resolveViewport(viewports, value || viewport, !!isRotated);

    if (!size && Object.keys(globals).length === 0) return [];
    return [toCaptureMode(name, globals, size)];
  });

const fromViewports = (references: unknown[], viewports: ViewportMap) =>
  references.flatMap((reference) => {
    const size = resolveViewport(viewports, reference);
    if (!size) return [];
    const name = /^\d+$/.test(`${reference}`) ? `${reference}px` : `${reference}`;
    return [toCaptureMode(name, {}, size)];
  });

/**
 * Determine the modes Chromatic captures for a story, based on its `chromatic` and `viewport`
 * parameters. Always returns at least one mode.
 */
export const resolveCaptureModes = ({
  chromatic,
  viewport,
}: {
  chromatic?: ChromaticConfig;
  viewport?: ViewportParameters;
}): CaptureMode[] => {
  const viewports = viewport?.options || viewport?.viewports || DEFAULT_VIEWPORTS;

  const modes = chromatic?.modes
    ? fromModes(chromatic.modes, viewports)
    : Array.isArray(chromatic?.viewports)
      ? fromViewports(chromatic.viewports, viewports)
      : [];

  if (modes.length > 0) return modes;
  return [{ ...toCaptureMode(`${DEFAULT_VIEWPORT_WIDTH}px`, {}), isDefault: true }];
};

/** The `viewport` global value that sizes the Storybook preview to the given mode. */
export const getViewportGlobal = ({ width, height }: Pick<CaptureMode, 'width' | 'height'>) => ({
  value: `${width}-${height}`,
  isRotated: false,
});
