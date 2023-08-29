import { SHARED_STATE_CHANGED, SHARED_STATE_SET } from "@storybook/core-events";
import { addons, useChannel } from "@storybook/manager-api";
import { useEffect, useMemo, useState } from "react";

// This hook is based on the implementation of useSharedState from Storybook's source code: https://github.com/storybookjs/storybook/blob/4d509a51811427e625f619f359db46c8117eee65/code/lib/preview-api/src/modules/store/hooks.ts#L47
// The official hook does not share changes across components correctly. This hook fixes that issue by adding a listener for client update events.
// We may push changes to the official hook in the future. However, there may be additional changes required on the storybook side to make this work.
export function useSharedState<S>(sharedId: string, defaultState?: S): [S, (s: S) => void] {
  const channel = addons.getChannel();

  const [lastValue] =
    channel.last(`${SHARED_STATE_CHANGED}-manager-${sharedId}`) ||
    channel.last(`${SHARED_STATE_SET}-manager-${sharedId}`) ||
    [];

  const [state, setState] = useState<S>(lastValue || defaultState);

  const allListeners = useMemo(
    () => ({
      [`${SHARED_STATE_CHANGED}-manager-${sharedId}`]: (s: S) => setState(s),
      [`${SHARED_STATE_SET}-manager-${sharedId}`]: (s: S) => setState(s),
      [`${SHARED_STATE_CHANGED}-client-${sharedId}`]: (s: S) => setState(s),
      [`${SHARED_STATE_SET}-client-${sharedId}`]: (s: S) => setState(s),
    }),
    [sharedId]
  );

  const emit = useChannel(allListeners, [sharedId]);

  useEffect(() => {
    // init
    if (defaultState !== undefined && !lastValue) {
      emit(`${SHARED_STATE_SET}-client-${sharedId}`, defaultState);
    }
  }, [defaultState, emit, lastValue, sharedId]);

  return [
    state,
    (s) => {
      setState(s);
      emit(`${SHARED_STATE_CHANGED}-client-${sharedId}`, s);
    },
  ];
}
