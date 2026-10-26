/**
 * Visual tweaks Chromatic applies to a story right before capturing it, to make snapshots
 * deterministic. They're grouped by the Chromatic emulator setting that controls them.
 */

export const EMULATOR_ATTRIBUTE = 'data-chromatic-emulator';

export interface TweakOptions {
  /** Freeze CSS and SVG animations and reset videos */
  animations?: boolean;
  /** Hide text carets and spelling/grammar markers */
  carets?: boolean;
  /** Text rendering, scrollbars, eager images */
  rendering?: boolean;
  /** Mark the body with `data-chromatic="true"` */
  identity?: boolean;
  /** Show CSS animations at their last frame rather than their first */
  pauseAnimationAtEnd?: boolean;
}

type StyleRoot = Document | ShadowRoot;

const getStyleTarget = (root: StyleRoot) => ('head' in root ? root.head : root);

const addStyle = (root: StyleRoot, rules: string[], { prepend = false } = {}) => {
  const doc = 'head' in root ? root : root.ownerDocument;
  const style = doc.createElement('style');
  style.setAttribute(EMULATOR_ATTRIBUTE, '');
  const target = getStyleTarget(root);
  if (prepend) target.prepend(style);
  else target.append(style);
  rules.forEach((rule, index) => style.sheet?.insertRule(rule, index));
  return style;
};

/** The document and every open shadow root in it. */
export const getStyleRoots = (doc: Document): StyleRoot[] => {
  const roots: StyleRoot[] = [doc];
  const visit = (node: Document | ShadowRoot) => {
    for (const element of Array.from(node.querySelectorAll('*'))) {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot);
        visit(element.shadowRoot);
      }
    }
  };
  visit(doc);
  return roots;
};

const forEachElement = <T extends Element>(
  roots: StyleRoot[],
  selector: string,
  fn: (el: T) => void
) => roots.forEach((root) => root.querySelectorAll<T>(selector).forEach(fn));

const forceReflow = (doc: Document) => doc.body.clientHeight;

/**
 * Restart all CSS animations and pause them at their first or last frame. Animations are first
 * removed altogether, then restored in a paused state, so they all start over from the beginning.
 */
const freezeCssAnimations = (root: StyleRoot, atEnd: boolean) => {
  const reset = addStyle(
    root,
    ['*', '*:before', '*:after'].map((s) => `${s} { animation: none !important; }`),
    { prepend: true }
  );
  const declarations = [
    'animation-delay: 0s !important',
    'animation-play-state: paused !important',
    'transition: none !important',
    `animation-direction: ${atEnd ? 'reverse' : 'normal'} !important`,
    'animation-iteration-count: 1 !important',
  ].join('; ');
  addStyle(
    root,
    ['*', '*:before', '*:after'].map((s) => `${s} { ${declarations}; }`),
    { prepend: true }
  );
  forceReflow('head' in root ? root : root.ownerDocument);
  reset.remove();
};

/** Reset playing videos to their first frame (or poster). */
const resetVideos = (roots: StyleRoot[]) => {
  const loaded: Promise<void>[] = [];
  forEachElement<HTMLVideoElement>(roots, 'video', (video) => {
    if (video.paused) return;
    loaded.push(
      new Promise((resolve) => {
        video.addEventListener('loadeddata', () => resolve(), { once: true });
        video.addEventListener('error', () => resolve(), { once: true });
        video.load();
        video.pause();
      })
    );
  });
  // Don't hold up the Chromatic emulator on videos that never load
  return Promise.race([Promise.all(loaded), new Promise((r) => setTimeout(r, 2000))]);
};

const pausedSvgs = new Set<SVGSVGElement>();

const previousBodyAttributes = new WeakMap<HTMLElement, Record<string, string | null>>();

const setBodyAttribute = (body: HTMLElement, name: string, value: string) => {
  const previous = previousBodyAttributes.get(body) ?? {};
  if (!(name in previous)) previous[name] = body.getAttribute(name);
  previousBodyAttributes.set(body, previous);
  body.setAttribute(name, value);
};

export const applyCaptureTweaks = async (doc: Document, options: TweakOptions) => {
  const roots = getStyleRoots(doc);
  const { animations, carets, rendering, identity, pauseAnimationAtEnd = true } = options;

  if (identity) {
    setBodyAttribute(doc.body, 'data-chromatic', 'true');
  }

  let videosReset: Promise<unknown> = Promise.resolve();
  if (animations) {
    videosReset = resetVideos(roots);
    roots.forEach((root) => freezeCssAnimations(root, pauseAnimationAtEnd));
    forEachElement<SVGSVGElement>(roots, 'svg', (svg) => {
      // Not all SVG elements support this (e.g. in some older browsers)
      if (typeof svg.pauseAnimations !== 'function') return;
      if (!svg.animationsPaused()) pausedSvgs.add(svg);
      svg.pauseAnimations();
      svg.setCurrentTime(0);
    });
  }

  if (carets) {
    setBodyAttribute(doc.body, 'spellcheck', 'false');
    roots.forEach((root) => {
      addStyle(root, ['* { caret-color: transparent !important; }'], { prepend: true });
      addStyle(root, [
        '@supports selector(::spelling-error) { *::spelling-error { text-decoration: none !important; } }',
        '@supports selector(::grammar-error) { *::grammar-error { text-decoration: none !important; } }',
      ]);
    });
  }

  if (rendering) {
    forEachElement<HTMLImageElement>(roots, 'img', (img) => img.setAttribute('loading', 'eager'));
    // Chromatic captures in a headless browser, which doesn't render scrollbars
    roots.forEach((root) =>
      addStyle(root, [
        '* { scrollbar-width: none !important; }',
        '*::-webkit-scrollbar { display: none !important; }',
      ])
    );
    addStyle(doc, ['* { text-rendering: geometricPrecision; }']);
  }

  await videosReset;

  if (rendering) {
    // Force the browser to redraw everything, flushing out any timing issues with styles/images
    const { display } = doc.body.style;
    doc.body.style.display = 'none';
    forceReflow(doc);
    doc.body.style.display = display;
  }
};

export const removeCaptureTweaks = (doc: Document) => {
  const roots = getStyleRoots(doc);
  forEachElement(roots, `style[${EMULATOR_ATTRIBUTE}]`, (style) => style.remove());
  pausedSvgs.forEach((svg) => svg.unpauseAnimations());
  pausedSvgs.clear();

  const previous = previousBodyAttributes.get(doc.body);
  if (previous) {
    for (const [name, value] of Object.entries(previous)) {
      if (value === null) doc.body.removeAttribute(name);
      else doc.body.setAttribute(name, value);
    }
    previousBodyAttributes.delete(doc.body);
  }
};
