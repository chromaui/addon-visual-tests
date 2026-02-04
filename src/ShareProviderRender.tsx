import { FailedIcon } from '@storybook/icons';
import pluralize from 'pluralize';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'storybook/internal/components';
import { Button } from 'storybook/internal/components';
import { API, useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { color, styled } from 'storybook/theming';

import { BUILD_STEP_CONFIG } from './buildSteps';
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  LOCAL_BUILD_PROGRESS,
  TEST_PROVIDER_ID,
} from './constants';
import { ConfigInfoPayload, LocalBuildProgress } from './types';
import { TelemetryContext } from './utils/TelemetryContext';
import { useAuth } from './utils/useAuth';
import { useBuildEvents } from './utils/useBuildEvents';
import { useProjectId } from './utils/useProjectId';
import { useSharedState } from './utils/useSharedState';
import { getTestProviderStore, useTestProviderStore } from './utils/useTestProviderStore';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: 24,
  maxWidth: 500,
  gap: 16,
}));

const Content = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
  fontSize: theme.typography.size.s1,
  color: theme.color.defaultText,
}));

const Title = styled.div(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  lineHeight: '20px',
}));

const Description = styled.div(({ theme }) => ({
  color: theme.textMutedColor,
}));

export const ShareProviderRender = ({ api }: { api: API }) => {
  const { addNotification, getStoryHrefs } = api;
  const { storyId } = useStorybookState();

  const trackEvent = useContext(TelemetryContext);
  const { projectId } = useProjectId();
  const [auth] = useAuth();
  const isLoggedIn = !!auth.token;

  const [isOffline, setOffline] = useSharedState<boolean>(IS_OFFLINE);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);

  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const [copied, setCopied] = useState(false);

  const lastStep = useRef(localBuildProgress?.currentStep);

  const testProviderState = useTestProviderStore(
    (state) => state[TEST_PROVIDER_ID] ?? 'test-provider-state:pending'
  );

  const { startBuild, stopBuild } = useBuildEvents({
    localBuildProgress,
    accessToken: auth.token,
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
    () => getTestProviderStore(TEST_PROVIDER_ID).onRunAll(startBuildIfPossible),
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
      description = localBuildProgress?.storybookUrl
        ? `Succesfully published`
        : localBuildProgress
          ? BUILD_STEP_CONFIG[localBuildProgress.currentStep].renderProgress(localBuildProgress)
          : 'Starting...';
      break;
    case localBuildProgress?.currentStep === 'aborted':
      description = 'Aborted by user';
      break;
    case localBuildProgress?.currentStep === 'complete':
      description = localBuildProgress.errorCount
        ? `Encountered ${pluralize('component error', localBuildProgress.errorCount, true)}`
        : `Succesfully published`;
      break;
    default:
      description = 'No snapshots will be taken';
  }

  const copyLink = () => {
    const networkAddress = (globalThis as any).STORYBOOK_NETWORK_ADDRESS;
    (globalThis as any).STORYBOOK_NETWORK_ADDRESS = localBuildProgress!.storybookUrl!;
    const { managerHref } = getStoryHrefs(storyId, { base: 'network' });
    navigator.clipboard.writeText(managerHref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    (globalThis as any).STORYBOOK_NETWORK_ADDRESS = networkAddress;
  };

  return (
    <Container>
      <Content>
        <div>
          <Title>Upload a build to share</Title>
          <Description>{description}</Description>
        </div>
        {localBuildProgress?.storybookUrl ? (
          <Button
            ariaLabel={false}
            padding="small"
            size="medium"
            variant="solid"
            onClick={copyLink}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        ) : warning ? null : testProviderState === 'test-provider-state:running' ? (
          <Button
            ariaLabel={false}
            padding="small"
            size="medium"
            variant="solid"
            onClick={stopBuild}
            disabled={
              !['initialize', 'build', 'upload'].includes(localBuildProgress?.currentStep ?? '')
            }
          >
            Cancel
          </Button>
        ) : (
          <Button
            ariaLabel={false}
            padding="small"
            size="medium"
            variant="solid"
            disabled={!isRunnable}
            onClick={startBuildIfPossible}
          >
            Upload & copy link
          </Button>
        )}
      </Content>
    </Container>
  );
};
