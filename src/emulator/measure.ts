/**
 * Determine the region of the page Chromatic would capture for a story. This is the area covered
 * by the story's rendered content (including portals and fixed position elements), rather than
 * the full viewport.
 */

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const EMPTY_BOX: Box = { left: 0, top: 0, right: 0, bottom: 0 };

const isEmpty = (box: Box) => box.right - box.left <= 0 || box.bottom - box.top <= 0;

const union = (boxes: Box[]): Box => ({
  left: Math.floor(Math.min(...boxes.map((b) => b.left))),
  top: Math.floor(Math.min(...boxes.map((b) => b.top))),
  right: Math.ceil(Math.max(...boxes.map((b) => b.right))),
  bottom: Math.ceil(Math.max(...boxes.map((b) => b.bottom))),
});

const toBox = ({ left, top, right, bottom }: DOMRect): Box => ({ left, top, right, bottom });

/** An element clips its content if overflow in either direction is not visible. */
const clipsOverflow = (style: CSSStyleDeclaration) =>
  (['overflowX', 'overflowY'] as const).some((property) => {
    const value = style[property];
    if (value === 'clip') {
      // Content may extend beyond the clip edge by the clip margin, so treat it as unclipped
      const margin = style.getPropertyValue('overflow-clip-margin');
      return !margin || margin === '0px';
    }
    return ['auto', 'hidden', 'scroll'].includes(value);
  });

/** The containing element Storybook renders the story into. */
export const getStoryContainer = (doc: Document) =>
  doc.querySelector('body.sb-show-errordisplay') ||
  doc.querySelector('#storybook-root') ||
  doc.querySelector('#root');

type IsExcluded = (element: Element) => boolean;

interface MeasureContext {
  /** The element containing everything that's captured, normally the body */
  root: Element;
  isExcluded: IsExcluded;
  range: Range;
}

/** Get the bounding box of a node, including any of its descendants which overflow it. */
const getNodeBox = (node: Node, context: MeasureContext): Box => {
  const { root, isExcluded, range } = context;
  const doc = node.ownerDocument!;
  const win = doc.defaultView!;

  if (node.nodeType === Node.TEXT_NODE) {
    range.selectNode(node);
    return toBox(range.getBoundingClientRect());
  }
  if (!(node instanceof win.Element) || isExcluded(node)) return EMPTY_BOX;

  let box = toBox(node.getBoundingClientRect());
  let includeChildren = false;

  // Overflow on the root doesn't clip anything, as the page itself scrolls
  if (node !== root) {
    const style = win.getComputedStyle(node);
    if (style.visibility === 'hidden') return EMPTY_BOX;
    if (style.display === 'contents') {
      // Elements with `display: contents` have no box of their own
      box = EMPTY_BOX;
      includeChildren = true;
    }
    if (!clipsOverflow(style)) includeChildren = true;
  }

  if (includeChildren) {
    const children = [
      ...Array.from(node.childNodes),
      ...Array.from(node.shadowRoot?.childNodes ?? []),
    ];
    for (const child of children) {
      if (child.nodeType !== Node.ELEMENT_NODE && child.nodeType !== Node.TEXT_NODE) continue;
      const childBox = getNodeBox(child, context);
      if (isEmpty(childBox)) continue;
      box = isEmpty(box) ? childBox : union([box, childBox]);
    }
  }

  return box;
};

/** Find the nodes which make up the captured content. */
const getCaptureNodes = ({ root, isExcluded }: MeasureContext, container: Element | null) => {
  const win = root.ownerDocument.defaultView!;
  const nodes: Node[] = [];

  // Every child of the body is captured, but for the story container we only want the content
  // inside it, not the (padded) container itself. Other children of the body are likely portals.
  for (const element of Array.from(root.children)) {
    if (isExcluded(element)) continue;
    if (element === container) nodes.push(...Array.from(element.childNodes));
    else nodes.push(element);
  }

  // Also capture any visible fixed position element, anywhere in the document
  const visit = (node: Node) => {
    if (node instanceof win.Element) {
      if (isExcluded(node)) return;
      const style = win.getComputedStyle(node);
      if (style.display === 'none') return;
      if (style.position === 'fixed' && style.visibility !== 'hidden' && !nodes.includes(node)) {
        nodes.push(node);
      }
      node.shadowRoot?.childNodes.forEach(visit);
    }
    node.childNodes.forEach(visit);
  };
  visit(root);

  return nodes;
};

export interface MeasureOptions {
  /** Clip the captured region to the viewport */
  cropToViewport?: boolean;
  /** Elements to leave out of the measurement, along with their descendants */
  isExcluded?: IsExcluded;
  /** The element containing everything that's captured. Defaults to the body. */
  root?: Element;
  /** The element the story renders into. Defaults to Storybook's root element. */
  container?: Element | null;
}

/**
 * Measure the captured region, in document coordinates. Chromatic captures with the page
 * scrolled to the top, so for accurate results the page should be scrolled to the top as well.
 */
export const measureCaptureBox = (doc: Document, options: MeasureOptions = {}): Box => {
  const {
    cropToViewport = false,
    isExcluded = () => false,
    root = doc.body,
    container = getStoryContainer(doc),
  } = options;
  const win = doc.defaultView!;
  const context: MeasureContext = { root, isExcluded, range: doc.createRange() };

  const boxes = getCaptureNodes(context, container)
    .map((node) => getNodeBox(node, context))
    .filter((box) => !isEmpty(box));
  // If there's nothing to capture, capture the whole page
  let box = boxes.length ? union(boxes) : getNodeBox(root, context);
  context.range.detach();

  // Convert from viewport to document coordinates
  box = {
    left: box.left + win.scrollX,
    top: box.top + win.scrollY,
    right: box.right + win.scrollX,
    bottom: box.bottom + win.scrollY,
  };

  if (cropToViewport) {
    const { innerWidth, innerHeight } = win;
    const cropped = {
      left: Math.max(0, box.left),
      top: Math.max(0, box.top),
      right: Math.min(innerWidth, box.right),
      bottom: Math.min(innerHeight, box.bottom),
    };
    // Content that's entirely out of view is captured as-is
    if (!isEmpty(cropped)) box = cropped;
  }

  // Content above or left of the page can't be captured
  return { ...box, left: Math.max(0, box.left), top: Math.max(0, box.top) };
};
