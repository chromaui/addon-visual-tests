import type { Decorator } from '@storybook/react-vite';
import React from 'react';
import { Channel } from 'storybook/internal/channels';

import { SharedState } from './SharedState';

export function withSharedState(key: string, value: any): Decorator {
  const state = SharedState.subscribe(key, new Channel({}));
  const initialState = state.value;

  return function sharedStateDecorator(Story) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      state.value = value;
      return () => {
        state.value = initialState;
      };
    }, []);

    return <Story />;
  };
}
