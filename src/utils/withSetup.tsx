import type { Decorator } from '@storybook/react-vite';
import React from 'react';

// Wraps a story with a setup function that runs once and tears down when the story is unmounted.
// This is similar to useEffect but runs _before_ rather than after the first render.
export function withSetup(setup: () => void | (() => void)): Decorator {
  let initialized = false;
  let teardown: void | (() => void);

  return function effectDecorator(Story) {
    if (!initialized) {
      teardown = setup();
      initialized = true;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      teardown?.();
      initialized = false;
    }, []);

    return <Story />;
  };
}
