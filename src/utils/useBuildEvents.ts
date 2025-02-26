import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useChannel } from 'storybook/internal/manager-api';

import { START_BUILD, STOP_BUILD } from '../constants';
import { LocalBuildProgress } from '../types';
import { debounce } from './debounce';
import { TelemetryContext } from './TelemetryContext';

export const useBuildEvents = ({
  localBuildProgress,
  accessToken,
}: {
  localBuildProgress: LocalBuildProgress | undefined;
  accessToken: string | null;
}) => {
  const emit = useChannel({});
  const trackEvent = useContext(TelemetryContext);
  const [isStarting, setStarting] = useState(false);
  const [isDisallowed, setDisallowed] = useState(false);

  const isCancelable = localBuildProgress
    ? ['initialize', 'build', 'upload'].includes(localBuildProgress?.currentStep)
    : false;

  const isRunning = localBuildProgress
    ? !['aborted', 'complete', 'error', 'limited'].includes(localBuildProgress.currentStep)
    : isStarting;

  const startBuild = useMemo(
    () =>
      debounce(
        'startBuild',
        () => {
          setDisallowed(false);
          setStarting(true);
          emit(START_BUILD, { accessToken });
          trackEvent?.({ action: 'startBuild' });
        },
        1000,
        false
      ),
    [accessToken, emit, trackEvent]
  );

  const stopBuild = useMemo(
    () =>
      debounce(
        'startBuild',
        () => {
          if (!isCancelable) {
            setDisallowed(true);
          } else {
            setStarting(false);
            emit(STOP_BUILD);
            trackEvent?.({ action: 'stopBuild' });
          }
        },
        1000,
        false
      ),
    [isCancelable, emit, trackEvent]
  );

  useEffect(() => {
    const timeout = isStarting && setTimeout(() => setStarting(false), 5000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isStarting]);

  return { isDisallowed, isRunning, startBuild, stopBuild };
};
