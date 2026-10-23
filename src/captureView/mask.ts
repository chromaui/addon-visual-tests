import type { Box } from './measure';
import { CAPTURE_VIEW_ATTRIBUTE } from './tweaks';

const MASK_ID = 'chromatic-capture-view-mask';
const MASK_OPACITY = 0.85;

const isTransparent = (color: string) =>
  !color || color === 'transparent' || /^rgba\(.*,\s*0\)$/.test(color.replace(/\s+/g, ' '));

/**
 * The page background color, which is what fills the area of the snapshot not covered by any
 * content. Falls back to white, like an unstyled page.
 */
export const getPageBackground = (doc: Document) => {
  const win = doc.defaultView!;
  const body = win.getComputedStyle(doc.body).backgroundColor;
  if (!isTransparent(body)) return body;
  const html = win.getComputedStyle(doc.documentElement).backgroundColor;
  return isTransparent(html) ? 'rgb(255, 255, 255)' : html;
};

/**
 * Cover everything outside the captured region with a translucent layer in the page background
 * color, and outline the captured region. The mask doesn't affect pointer events.
 */
export const renderMask = (doc: Document, box: Box) => {
  const win = doc.defaultView!;
  let mask = doc.getElementById(MASK_ID);
  if (!mask) {
    mask = doc.createElement('div');
    mask.id = MASK_ID;
    mask.setAttribute(CAPTURE_VIEW_ATTRIBUTE, '');
    mask.setAttribute('aria-hidden', 'true');
    const fill = doc.createElement('div');
    fill.setAttribute('data-fill', '');
    const outline = doc.createElement('div');
    outline.setAttribute('data-outline', '');
    mask.append(fill, outline);
    doc.body.append(mask);
  }

  const fill = mask.querySelector<HTMLElement>('[data-fill]')!;
  const outline = mask.querySelector<HTMLElement>('[data-outline]')!;

  // The box is in document coordinates, the mask is fixed to the viewport
  const left = box.left - win.scrollX;
  const top = box.top - win.scrollY;
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const { innerWidth: vw, innerHeight: vh } = win;

  Object.assign(mask.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
    margin: '0',
    padding: '0',
  });
  Object.assign(fill.style, {
    position: 'absolute',
    inset: '0',
    background: getPageBackground(doc),
    opacity: `${MASK_OPACITY}`,
    clipPath: `path(evenodd, 'M0 0H${vw}V${vh}H0Z M${left} ${top}h${width}v${height}h${-width}Z')`,
  });
  // Drawn just outside the captured region, so it doesn't cover any captured pixels
  Object.assign(outline.style, {
    position: 'absolute',
    boxSizing: 'border-box',
    left: `${left - 1}px`,
    top: `${top - 1}px`,
    width: `${width + 2}px`,
    height: `${height + 2}px`,
    border: '1px dashed rgba(128, 128, 128, 0.8)',
  });
};

export const removeMask = (doc: Document) => doc.getElementById(MASK_ID)?.remove();
