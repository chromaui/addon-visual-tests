import { FailedIcon } from '@storybook/icons';
import { PlayHollowIcon, StopAltIcon } from '@storybook/icons';
import pluralize from 'pluralize';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Link } from 'storybook/internal/components';
import { Button, ProgressSpinner } from 'storybook/internal/components';
import {
  experimental_getTestProviderStore,
  experimental_useStatusStore,
  experimental_useTestProviderStore,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import { color, styled } from 'storybook/theming';

import { BUILD_STEP_CONFIG } from './buildSteps';
import { BuildProgressInline } from './components/BuildProgressBarInline';
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

export const ShareMenu = () => {
  const { addNotification } = useStorybookApi();

  const trackEvent = useContext(TelemetryContext);
  const { projectId } = useProjectId();
  const [accessToken] = useAccessToken();
  const isLoggedIn = !!accessToken;

  const [isOffline, setOffline] = useSharedState<boolean>(IS_OFFLINE);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);

  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const lastStep = useRef(localBuildProgress?.currentStep);

  const testProviderState = experimental_useTestProviderStore(
    (state) => state[TEST_PROVIDER_ID] ?? 'test-provider-state:pending'
  );

  const { startBuild, stopBuild } = useBuildEvents({
    localBuildProgress,
    accessToken,
  });

  let warning: string | undefined;
  if (isOffline) warning = 'Not available offline';
  if (hasConfigProblem) warning = 'Configuration problem';
  if (gitInfoError) warning = 'Git synchronization problem';
  if (!isLoggedIn) warning = 'Login required';
  if (!projectId) warning = 'Set up visual tests';

  const isRunnable = !warning && testProviderState !== 'test-provider-state:crashed';

  const startBuildIfPossible = useCallback(() => {
    if (isRunnable) {
      startBuild(true);
    }
  }, [isRunnable, startBuild]);

  useEffect(
    () => experimental_getTestProviderStore(TEST_PROVIDER_ID).onRunAll(startBuildIfPossible),
    [startBuildIfPossible]
  );

  const clickNotification = useCallback(({ onDismiss }: { onDismiss: () => void }) => {
    onDismiss();
  }, []);

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

  const clickWarning = useCallback(() => {}, []);

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
    case localBuildProgress?.currentStep === 'aborted':
      description = 'Aborted by user';
      break;
    case localBuildProgress?.currentStep === 'complete':
      description = localBuildProgress.errorCount
        ? `Encountered ${pluralize('component error', localBuildProgress.errorCount, true)}`
        : `Published`;
      break;
    default:
      description = 'Not run';
  }

  if (localBuildProgress?.isPublishOnly === false) {
    description = 'Visual tests in progress';
  }

  return (
    <Container>
      <Info>
        {localBuildProgress?.isPublishOnly ? (
          <BuildProgressInline localBuildProgress={localBuildProgress} />
        ) : (
          <DescriptionWrapper>{description}</DescriptionWrapper>
        )}
      </Info>

      <Actions>
        {warning ? null : testProviderState === 'test-provider-state:running' ? (
          <Button
            ariaLabel="Cancel"
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
        ) : (
          <Button
            ariaLabel="Publish"
            size="medium"
            variant="ghost"
            padding="small"
            disabled={!isRunnable}
            onClick={startBuildIfPossible}
          >
            Publish
          </Button>
        )}
      </Actions>
    </Container>
  );
};
