import type { Decorator } from "@storybook/react";
import type { StoryContext } from "storybook/internal/types";
import React from "react";

export const storyWrapper = (
  Wrapper: React.FunctionComponent<any>,
  getProps?: (context: StoryContext<any>) => any
): Decorator =>
  function StoryWrapper(Story: React.FunctionComponent<any>, context: StoryContext<any>) {
    return (
      <Wrapper {...getProps?.(context)}>
        <Story />
      </Wrapper>
    );
  };
