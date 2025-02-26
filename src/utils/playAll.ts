import type { ReactRenderer } from '@storybook/react';
import type { StoryAnnotations } from 'storybook/internal/types';

export function playAll<Story extends StoryAnnotations<ReactRenderer>>(
  ...sequence: (Story | Story['play'])[]
): Story['play'] {
  return async (context) => {
    const canvasNodes = context.canvasElement.querySelectorAll<HTMLElement>('[data-canvas]');
    const canvasElements = canvasNodes.length ? Array.from(canvasNodes) : [context.canvasElement];

    await Promise.all(
      sequence.flatMap((storyOrPlay) =>
        typeof storyOrPlay === 'function'
          ? canvasElements.map((canvasElement, canvasIndex) =>
              storyOrPlay({ ...context, canvasElement, canvasIndex })
            )
          : storyOrPlay?.play?.(context)
      )
    );
  };
}
