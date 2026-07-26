import type { Decorator } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { storyWrapper } from './storyWrapper';
import { TelemetryProvider } from './TelemetryContext';
import { withSetup } from './withSetup';

/**
 * Overrides the global telemetry provider with a spy so play functions can assert on the events a
 * screen reports. The spy is cleared when the story mounts, not on every render, so assertions
 * survive re-renders triggered mid-interaction.
 *
 * Note the `theme` decorator renders two canvases by default, which share one provider — assert
 * with `toHaveBeenCalledWith` rather than on call counts, or pin the story to a single theme.
 */
export const telemetrySpy = () => {
  const trackEvent = fn().mockName('trackEvent');

  const decorators: Decorator[] = [
    storyWrapper(TelemetryProvider, () => ({ value: trackEvent })),
    withSetup(() => {
      trackEvent.mockClear();
    }),
  ];

  return { trackEvent, decorators };
};
