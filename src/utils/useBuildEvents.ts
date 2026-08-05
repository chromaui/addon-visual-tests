import { useEffect, useMemo, useState } from 'react';
import { useChannel } from 'storybook/manager-api';

import { START_BUILD, STOP_BUILD, TELEMETRY } from '../constants';
import { LocalBuildProgress } from '../types';
import { debounce } from './debounce';

export const useBuildEvents = ({
  localBuildProgress,
  accessToken,
}: {
  localBuildProgress: LocalBuildProgress | undefined;
  accessToken: string | null;
}) => {
  const emit = useChannel({});
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
          // Unattributed so the Test Provider stays visible; screens that need screen attribution
          // report their own `startBuild` action via `useTelemetry` before calling this.
          emit(TELEMETRY, { action: 'startBuild' });
        },
        1000,
        false
      ),
    [accessToken, emit]
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
            emit(TELEMETRY, { action: 'stopBuild' });
          }
        },
        1000,
        false
      ),
    [isCancelable, emit]
  );

  useEffect(() => {
    const timeout = isStarting && setTimeout(() => setStarting(false), 5000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isStarting]);

  return { isDisallowed, isRunning, startBuild, stopBuild };
};
