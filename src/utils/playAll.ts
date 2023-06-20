import type { StoryObj } from "@storybook/react";

export function playAll<Story extends StoryObj>(
  ...sequence: (Story | Story["play"])[]
): Story["play"] {
  return async (context) => {
    const canvasNodes = context.canvasElement.querySelectorAll<HTMLElement>("[data-canvas]");
    const canvasElements = canvasNodes.length ? Array.from(canvasNodes) : [context.canvasElement];

    await Promise.all(
      sequence.flatMap((storyOrPlay) =>
        typeof storyOrPlay === "function"
          ? canvasElements.map((canvasElement) => storyOrPlay({ ...context, canvasElement }))
          : storyOrPlay?.play?.(context)
      )
    );
  };
}
