import { FailedIcon, PassedIcon } from '@storybook/icons';
import pluralize from 'pluralize';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { type API, experimental_useStatusStore, useStorybookState } from 'storybook/manager-api';
import { color } from 'storybook/theming';

import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
} from '../constants';
import { ConfigInfoPayload, LocalBuildProgress } from '../types';
import { useAccessToken } from '../utils/graphQLClient';
import { TelemetryContext } from '../utils/TelemetryContext';
import { useBuildEvents } from '../utils/useBuildEvents';
import { useProjectId } from '../utils/useProjectId';
import { useSharedState } from '../utils/useSharedState';
import { SidebarTopButton } from './SidebarTopButton';

interface SidebarTopProps {
  api: API;
}

export const SidebarTop = ({ api }: SidebarTopProps) => {
  const { addNotification, clearNotification, selectStory, setOptions, togglePanel } = api;

  const trackEvent = useContext(TelemetryContext);
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [isOffline, setOffline] = useSharedState<boolean>(IS_OFFLINE);
  const [isOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);

  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const lastStep = useRef(localBuildProgress?.currentStep);
  const { index, storyId, viewMode } = useStorybookState();
  const warningStatusCount = experimental_useStatusStore(
    (allStatuses) =>
      Object.values(allStatuses)
        .map((storyStatus) => storyStatus[ADDON_ID]?.value)
        .filter((value) => value === 'status-value:warning').length
  );

  const openVisualTestsPanel = useCallback(
    (warning?: string) => {
      setOptions({ selectedPanel: PANEL_ID });
      togglePanel(true);
      if (index && viewMode !== 'story') {
        // Select the next story in the index, because docs mode doesn't show addon panels
        const currentIndex = Object.keys(index).indexOf(storyId);
        const entries = Object.entries(index).slice(currentIndex > 0 ? currentIndex : 0);
        const [nextStoryId] = entries.find(([, { type }]) => type === 'story') || [];
        if (nextStoryId) selectStory(nextStoryId);
      }
      if (warning) {
        trackEvent?.({ action: 'openWarning', warning });
      }
    },
    [setOptions, togglePanel, trackEvent, index, selectStory, storyId, viewMode]
  );

  const clickNotification = useCallback(
    ({ onDismiss }: { onDismiss: () => void }) => {
      onDismiss();
      openVisualTestsPanel();
    },
    [openVisualTestsPanel]
  );

  useEffect(() => {
    const offline = () => setOffline(true);
    const online = () => setOffline(false);
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => {
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    };
  }, [setOffline]);

  useEffect(() => {
    if (localBuildProgress?.currentStep === lastStep.current) return;
    lastStep.current = localBuildProgress?.currentStep;

    if (localBuildProgress?.currentStep === 'initialize') {
      const notificationId = `${ADDON_ID}/build-initialize/${Date.now()}`;
      addNotification({
        id: notificationId,
        content: {
          headline: 'Build started',
          subHeadline: 'Check the visual test addon to see the progress of your build.',
        },
        icon: <PassedIcon color={color.positive} />,
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(notificationId), 8_000);
    }

    if (localBuildProgress?.currentStep === 'aborted') {
      const notificationId = `${ADDON_ID}/build-aborted/${Date.now()}`;
      addNotification({
        id: notificationId,
        content: {
          headline: 'Build canceled',
          subHeadline: 'Aborted by user.',
        },
        icon: <FailedIcon color={color.negative} />,
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(notificationId), 8_000);
    }

    if (localBuildProgress?.currentStep === 'complete') {
      const notificationId = `${ADDON_ID}/build-complete/${Date.now()}`;
      addNotification({
        id: notificationId,
        content: {
          headline: 'Build complete',

          subHeadline: localBuildProgress.errorCount
            ? `Encountered ${pluralize('component error', localBuildProgress.errorCount, true)}`
            : warningStatusCount
              ? `Found ${pluralize('story', warningStatusCount, true)} with ${pluralize(
                  'change',
                  warningStatusCount
                )}`
              : 'No visual changes detected',
        },
        icon: <PassedIcon color={color.positive} />,
        duration: 8_000,
        onClick: clickNotification,
      });

      // Kept for backwards compatibility (before `duration` support was added)
      setTimeout(() => clearNotification(notificationId), 8_000);
    }

    if (localBuildProgress?.currentStep === 'error') {
      addNotification({
        id: `${ADDON_ID}/build-error/${Date.now()}`,
        content: {
          headline: 'Build error',
          subHeadline: 'Check the Storybook process on the command line for more details.',
        },
        icon: <FailedIcon color={color.negative} />,
        onClick: clickNotification,
      });
    }

    if (localBuildProgress?.currentStep === 'limited') {
      addNotification({
        id: `${ADDON_ID}/build-limited/${Date.now()}`,
        content: {
          headline: 'Build limited',
          subHeadline:
            'Your account has insufficient snapshots remaining to run this build. Visit your billing page to find out more.',
        },
        icon: <FailedIcon color={color.negative} />,
        onClick: clickNotification,
      });
    }
  }, [
    addNotification,
    clearNotification,
    clickNotification,
    localBuildProgress?.currentStep,
    localBuildProgress?.errorCount,
    localBuildProgress?.changeCount,
    warningStatusCount,
  ]);

  const { isDisallowed, isRunning, startBuild, stopBuild } = useBuildEvents({
    localBuildProgress,
    accessToken,
  });

  let warning: string | undefined;
  if (!projectId) warning = 'Visual tests locked until a project is selected.';
  if (!isLoggedIn) warning = 'Visual tests locked until you are logged in.';
  if (gitInfoError) warning = 'Visual tests locked due to Git synchronization problem.';
  if (hasConfigProblem) warning = 'Visual tests locked due to configuration problem.';
  if (isOffline) warning = 'Visual tests locked while offline.';

  const clickWarning = useCallback(
    () => openVisualTestsPanel(warning),
    [openVisualTestsPanel, warning]
  );

  if (globalThis.CONFIG_TYPE !== 'DEVELOPMENT') {
    return null;
  }

  return (
    <SidebarTopButton
      isDisabled={!!warning}
      isDisallowed={isDisallowed}
      isOutdated={isOutdated}
      isRunning={isRunning}
      localBuildProgress={localBuildProgress}
      warning={warning}
      clickWarning={clickWarning}
      startBuild={startBuild}
      stopBuild={stopBuild}
    />
  );
};
