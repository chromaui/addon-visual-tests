import type { ReactRenderer } from '@storybook/react-vite';
import type { StoryAnnotations } from 'storybook/internal/types';
import { within } from 'storybook/test';

/**
 * Runs a sequence of play functions on multiple canvases in parallel.
 * This is generally preferable for performance as it runs on all canvases at the same time.
 */
export function playAll<Story extends StoryAnnotations<ReactRenderer>>(
  ...sequence: (Story | Story['play'])[]
): Story['play'] {
  return async (context) => {
    const canvasNodes = context.canvasElement.querySelectorAll<HTMLElement>('[data-canvas]');
    const canvasElements = canvasNodes.length ? Array.from(canvasNodes) : [context.canvasElement];

    for (const storyOrPlay of sequence) {
      if (typeof storyOrPlay === 'function') {
        await Promise.all(
          canvasElements.map((canvasElement, canvasIndex) => {
            const canvas = within(canvasElement);
            return storyOrPlay({ ...context, canvas, canvasElement, canvasIndex });
          })
        );
      } else {
        await storyOrPlay?.play?.(context);
      }
    }
  };
}

/**
 * Runs a sequence of play functions on multiple canvases sequentially.
 * This is necessary when interacting with popovers, as no more than one can be open at a time.
 */
export function playSequentially<Story extends StoryAnnotations<ReactRenderer>>(
  ...sequence: (Story | Story['play'])[]
): Story['play'] {
  return async (context) => {
    const canvasNodes = context.canvasElement.querySelectorAll<HTMLElement>('[data-canvas]');
    const canvasElements = canvasNodes.length ? Array.from(canvasNodes) : [context.canvasElement];

    for (let canvasIndex = 0; canvasIndex < canvasElements.length; canvasIndex++) {
      const canvasElement = canvasElements[canvasIndex];
      const canvas = within(canvasElement);
      for (const storyOrPlay of sequence) {
        if (typeof storyOrPlay === 'function') {
          await storyOrPlay({ ...context, canvas, canvasElement, canvasIndex });
        } else {
          await storyOrPlay?.play?.(context);
        }
      }
    }
  };
}
