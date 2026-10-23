import { FORCE_REMOUNT, STORY_FINISHED, STORY_RENDERED } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

import { CAPTURE_VIEW_PARAM } from '../constants';
import type { ChromaticParameters } from '../types';
import { setChromaticIdentity } from './identity';
import { removeMask, renderMask } from './mask';
import { type Box, measureCaptureBox } from './measure';
import { type CaptureViewSettings, getCaptureViewSettings } from './settings';
import { applyCaptureTweaks, CAPTURE_VIEW_ATTRIBUTE, removeCaptureTweaks } from './tweaks';

const MAX_DELAY = 15_000;

interface CaptureViewState {
  storyId: string;
  active: boolean;
  settings: CaptureViewSettings;
  chromatic: ChromaticParameters['chromatic'];
}

let state: CaptureViewState | undefined;
let runId = 0;
let listening = false;
let stopMaskUpdates: (() => void) | undefined;

// Our own elements and Storybook's highlight overlay aren't part of the captured story
const isExcluded = (element: Element) =>
  element.hasAttribute(CAPTURE_VIEW_ATTRIBUTE) || element.id.startsWith('storybook-highlights-');

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Keep the mask in sync with the captured region as the story changes or the page resizes. */
const startMaskUpdates = (cropToViewport: boolean) => {
  stopMaskUpdates?.();

  let box: Box | undefined;
  let frame = 0;
  const update = (remeasure: boolean) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (remeasure || !box) box = measureCaptureBox(document, { cropToViewport, isExcluded });
      renderMask(document, box);
    });
  };
  const onScroll = () => update(false);
  const onResize = () => update(true);
  const observer = new MutationObserver((records) => {
    const isOwnMutation = (node: Node) =>
      !!(node instanceof Element ? node : node.parentElement)?.closest(
        `[${CAPTURE_VIEW_ATTRIBUTE}]`
      );
    if (records.some(({ target }) => !isOwnMutation(target))) update(true);
  });

  update(true);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  observer.observe(document.body, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  stopMaskUpdates = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    observer.disconnect();
    removeMask(document);
    stopMaskUpdates = undefined;
  };
};

const teardown = () => {
  runId++;
  stopMaskUpdates?.();
  removeCaptureTweaks(document);
};

/**
 * Prepare the rendered story the way Chromatic does right before capturing it: wait for fonts and
 * the configured delay, scroll to the top and apply the visual tweaks.
 */
const applyCaptureView = async () => {
  const currentRunId = ++runId;
  removeCaptureTweaks(document);

  if (!state?.active) {
    stopMaskUpdates?.();
    return;
  }

  const { settings, chromatic } = state;
  await document.fonts?.ready;
  const delay = Math.min(MAX_DELAY, chromatic?.delay ?? 0);
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  await nextFrame();
  await nextFrame();
  if (currentRunId !== runId) return;

  window.scrollTo(0, 0);
  await applyCaptureTweaks(document, {
    animations: settings.animations,
    carets: settings.carets,
    rendering: settings.rendering,
    identity: settings.identity,
    pauseAnimationAtEnd: chromatic?.pauseAnimationAtEnd ?? true,
  });
  if (currentRunId !== runId) return;

  if (settings.mask) startMaskUpdates(!!chromatic?.cropToViewport);
  else stopMaskUpdates?.();
};

const listen = () => {
  if (listening || !addons.hasChannel()) return;
  listening = true;
  const channel = addons.getChannel();
  channel.on(STORY_RENDERED, (storyId: string) => {
    if (storyId === state?.storyId) applyCaptureView();
  });
  channel.on(STORY_FINISHED, ({ storyId }: { storyId: string }) => {
    if (storyId === state?.storyId) applyCaptureView();
  });
};

export const withCaptureView = (StoryFn: () => unknown, context: any) => {
  const settings = getCaptureViewSettings(context.globals?.[CAPTURE_VIEW_PARAM]);
  const active = settings.enabled && context.viewMode === 'story';
  const identity = active && settings.identity;

  listen();
  const previous = state;
  if (previous && previous.storyId !== context.id) teardown();
  state = { storyId: context.id, active, settings, chromatic: context.parameters?.chromatic };

  // Must happen before the story renders, so `isChromatic()` returns the right value
  setChromaticIdentity(identity);

  // Remount when switching identity, so components that check `isChromatic()` once on mount
  // (e.g. in an effect) pick up the change.
  const previousIdentity = !!previous?.active && previous.settings.identity;
  if (previous?.storyId === context.id && previousIdentity !== identity && addons.hasChannel()) {
    const { id: storyId } = context;
    setTimeout(() => addons.getChannel().emit(FORCE_REMOUNT, { storyId }));
  }

  return StoryFn();
};
