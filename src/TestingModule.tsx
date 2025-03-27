import { FailedIcon } from '@storybook/icons';
import { PlayHollowIcon, StopAltIcon } from '@storybook/icons';
import pluralize from 'pluralize';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Link } from 'storybook/internal/components';
import { Button, ProgressSpinner, TooltipNote, WithTooltip } from 'storybook/internal/components';
import {
  experimental_getTestProviderStore,
  experimental_useStatusStore,
  experimental_useTestProviderStore,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import { color } from 'storybook/theming';
import { styled } from 'storybook/theming';

import { BUILD_STEP_CONFIG } from './buildSteps';
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
  TEST_PROVIDER_ID,
} from './constants';
import { ConfigInfoPayload, LocalBuildProgress } from './types';
import { useAccessToken } from './utils/graphQLClient';
import { TelemetryContext } from './utils/TelemetryContext';
import { useBuildEvents } from './utils/useBuildEvents';
import { useProjectId } from './utils/useProjectId';
import { useSharedState } from './utils/useSharedState';

const Container = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
});

const Info = styled.div({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 8,
});

const Actions = styled.div({
  display: 'flex',
  gap: 4,
});

const TitleWrapper = styled.div<{ crashed?: boolean }>(({ crashed, theme }) => ({
  fontSize: theme.typography.size.s1,
  fontWeight: crashed ? 'bold' : 'normal',
  color: crashed ? theme.color.negativeText : theme.color.defaultText,
}));

const DescriptionWrapper = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
}));

const Progress = styled(ProgressSpinner)({
  margin: 4,
});

const StopIcon = styled(StopAltIcon)({
  width: 10,
});

export const TestingModule = () => {
  const { addNotification, selectStory, setOptions, togglePanel } = useStorybookApi();
  const warningStatusCount = experimental_useStatusStore(
    (allStatuses) =>
      Object.values(allStatuses)
        .map((storyStatus) => storyStatus[ADDON_ID]?.value)
        .filter((value) => value === 'status-value:warning').length
  );

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

  const testProviderState = experimental_useTestProviderStore(
    (state) => state[TEST_PROVIDER_ID] ?? 'test-provider-state:pending'
  );

  const { startBuild, stopBuild } = useBuildEvents({
    localBuildProgress,
    accessToken,
  });

  useEffect(
    () => experimental_getTestProviderStore(TEST_PROVIDER_ID).onRunAll(startBuild),
    [startBuild]
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
  }, [addNotification, clickNotification, localBuildProgress?.currentStep]);

  let warning: string | undefined;
  if (!projectId) warning = 'Select a project';
  if (!isLoggedIn) warning = 'Login required';
  if (gitInfoError) warning = 'Git synchronization problem';
  if (hasConfigProblem) warning = 'Configuration problem';
  if (isOffline) warning = 'Not available while offline';

  const clickWarning = useCallback(
    () => openVisualTestsPanel(warning),
    [openVisualTestsPanel, warning]
  );

  let description: string | React.ReactNode;
  switch (true) {
    case !!warning:
      description = <Link onClick={clickWarning}>{warning}</Link>;
      break;
    case testProviderState === 'test-provider-state:running':
      description = localBuildProgress
        ? BUILD_STEP_CONFIG[localBuildProgress.currentStep].renderProgress(localBuildProgress)
        : 'Starting...';
      break;
    case !!isOutdated:
      description = 'Test results outdated';
      break;
    case localBuildProgress?.currentStep === 'aborted':
      description = 'Aborted by user';
      break;
    case localBuildProgress?.currentStep === 'complete':
      description = localBuildProgress.errorCount
        ? `Encountered ${pluralize('component error', localBuildProgress.errorCount, true)}`
        : warningStatusCount
          ? `Found ${pluralize('story', warningStatusCount, true)} with ${pluralize('change', warningStatusCount)}`
          : 'No visual changes detected';
      break;
    default:
      description = 'Not run';
  }

  return (
    <Container>
      <Info>
        <TitleWrapper crashed={testProviderState === 'test-provider-state:crashed'}>
          {localBuildProgress?.currentStep === 'error' ||
          localBuildProgress?.currentStep === 'limited'
            ? "Visual tests didn't complete"
            : 'Visual tests'}
        </TitleWrapper>
        <DescriptionWrapper>{description}</DescriptionWrapper>
      </Info>

      <Actions>
        {warning ? null : testProviderState === 'test-provider-state:running' ? (
          <WithTooltip
            hasChrome={false}
            trigger="hover"
            tooltip={<TooltipNote note="Stop Visual tests" />}
          >
            <Button
              aria-label="Stop Visual tests"
              size="medium"
              variant="ghost"
              padding="none"
              onClick={stopBuild}
              disabled={
                !['initialize', 'build', 'upload'].includes(localBuildProgress?.currentStep ?? '')
              }
            >
              <Progress percentage={localBuildProgress?.buildProgressPercentage}>
                <StopIcon />
              </Progress>
            </Button>
          </WithTooltip>
        ) : (
          <WithTooltip
            hasChrome={false}
            trigger="hover"
            tooltip={<TooltipNote note="Start Visual tests" />}
          >
            <Button
              aria-label="Start Visual tests"
              size="medium"
              variant="ghost"
              padding="small"
              onClick={startBuild}
              disabled={testProviderState === 'test-provider-state:crashed'}
            >
              <PlayHollowIcon />
            </Button>
          </WithTooltip>
        )}
      </Actions>
    </Container>
  );
};
