import pluralize from 'pluralize';
import React, { useCallback, useRef, useState } from 'react';
import { Button, Link } from 'storybook/internal/components';
import type { API } from 'storybook/manager-api';
import { experimental_getStatusStore, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { BUILD_STEP_CONFIG } from './buildSteps';
import { Spinner } from './components/design-system';
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  LOCAL_BUILD_PROGRESS,
  REMOVE_ADDON,
  TELEMETRY,
  TEST_PROVIDER_ID,
} from './constants';
import { Authentication } from './screens/Authentication/Authentication';
import { GitError } from './screens/Errors/GitError';
import { LinkedProject } from './screens/LinkProject/LinkedProject';
import { LinkingProjectFailed } from './screens/LinkProject/LinkingProjectFailed';
import { LinkProject } from './screens/LinkProject/LinkProject';
import { NoDevServer } from './screens/NoDevServer/NoDevServer';
import { NoNetwork } from './screens/NoNetwork/NoNetwork';
import { UninstallProvider } from './screens/Uninstalled/UninstallContext';
import { Uninstalled } from './screens/Uninstalled/Uninstalled';
import { ControlsProvider } from './screens/VisualTests/ControlsContext';
import { RunBuildProvider } from './screens/VisualTests/RunBuildContext';
import {
  ConfigInfoPayload,
  GitInfoPayload,
  LocalBuildProgress,
  UpdateStatusFunction,
} from './types';
import { createClient, GraphQLClientProvider } from './utils/graphQLClient';
import { TelemetryProvider } from './utils/TelemetryContext';
import { useAuth } from './utils/useAuth';
import { useBuildEvents } from './utils/useBuildEvents';
import { useChannelFetch } from './utils/useChannelFetch';
import { useProjectId } from './utils/useProjectId';
import { useSessionState } from './utils/useSessionState';
import { useSharedState } from './utils/useSharedState';
import { useTestProviderStore } from './utils/useTestProviderStore';

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

const statusStore = experimental_getStatusStore(ADDON_ID);

export const ShareProviderRender = ({ api }: { api: API }) => {
  const { addNotification, getStoryHrefs } = api;
  const { storyId } = useStorybookState();

  const {
    loading: projectInfoLoading,
    projectId,
    configFile,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated,
  } = useProjectId();

  const [auth] = useAuth();
  const isLoggedIn = !!auth.token;

  const [isOffline] = useSharedState<boolean>(IS_OFFLINE);
  const [localBuildProgress] = useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);

  const [configInfo] = useSharedState<ConfigInfoPayload>(CONFIG_INFO);
  const hasConfigProblem = Object.keys(configInfo?.problems || {}).length > 0;

  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);

  const [copied, setCopied] = useState(false);

  const lastStep = useRef(localBuildProgress?.currentStep);

  const testProviderState = useTestProviderStore(
    (state) => state[TEST_PROVIDER_ID] ?? 'test-provider-state:pending'
  );

  const { isRunning, startBuild, stopBuild } = useBuildEvents({
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

  // const clickNotification = useCallback(({ onDismiss }: { onDismiss: () => void }) => {
  //   onDismiss();
  // }, []);

  // useEffect(() => {
  //   if (localBuildProgress?.currentStep === lastStep.current) return;
  //   lastStep.current = localBuildProgress?.currentStep;

  //   if (localBuildProgress?.currentStep === 'error') {
  //     addNotification({
  //       id: `${ADDON_ID}/build-error/${Date.now()}`,
  //       content: {
  //         headline: 'Build error',
  //         subHeadline: 'Check the Storybook process on the command line for more details.',
  //       },
  //       icon: <FailedIcon color={color.negative} />,
  //       onClick: clickNotification,
  //     });
  //   }

  //   if (localBuildProgress?.currentStep === 'limited') {
  //     addNotification({
  //       id: `${ADDON_ID}/build-limited/${Date.now()}`,
  //       content: {
  //         headline: 'Build limited',
  //         subHeadline:
  //           'Your account has insufficient snapshots remaining to run this build. Visit your billing page to find out more.',
  //       },
  //       icon: <FailedIcon color={color.negative} />,
  //       onClick: clickNotification,
  //     });
  //   }
  // }, [addNotification, clickNotification, localBuildProgress?.currentStep]);

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

  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const { emit } = api;

  // If the user creates a project in a dialog (either during login or later, it get set here)
  const [createdProjectId, setCreatedProjectId] = useSessionState<string>('createdProjectId');
  const [addonUninstalled, setAddonUninstalled] = useSharedState<boolean>(REMOVE_ADDON);

  const trackEvent = useCallback((data: any) => emit(TELEMETRY, data), [emit]);

  const channelFetch = useChannelFetch();
  const fetch = globalThis.LOGLEVEL === 'debug' ? globalThis.fetch : channelFetch;
  const withProviders = (children: React.ReactNode) => (
    <GraphQLClientProvider value={createClient({ fetch })}>
      <TelemetryProvider value={trackEvent}>
        <UninstallProvider
          addonUninstalled={addonUninstalled}
          setAddonUninstalled={setAddonUninstalled}
        >
          <ControlsProvider>
            <RunBuildProvider watchState={{ isRunning, startBuild, stopBuild }}>
              <div style={{ containerType: 'size', height: '100%' }}>{children}</div>
            </RunBuildProvider>
          </ControlsProvider>
        </UninstallProvider>
      </TelemetryProvider>
    </GraphQLClientProvider>
  );

  if (addonUninstalled) {
    return withProviders(null);
  }

  if (globalThis.CONFIG_TYPE !== 'DEVELOPMENT') {
    return withProviders(<NoDevServer />);
  }

  if (isOffline) {
    return withProviders(<NoNetwork offline={isOffline} />);
  }

  // Render the Authentication flow if the user is not signed in.
  if (!auth.token) {
    return withProviders(
      <Authentication setCreatedProjectId={setCreatedProjectId} hasProjectId={!!projectId} />
    );
  }

  if (gitInfoError || !gitInfo) {
    return withProviders(<GitError gitInfoError={gitInfoError} />);
  }

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading) {
    return <Spinner />;
  }

  if (!projectId) {
    return withProviders(
      <LinkProject
        createdProjectId={createdProjectId}
        setCreatedProjectId={setCreatedProjectId}
        onUpdateProject={updateProject}
      />
    );
  }

  if (projectUpdatingFailed) {
    // These should always be set when we get this error
    if (!configFile) throw new Error(`Missing config file after configuration failure`);
    return withProviders(<LinkingProjectFailed projectId={projectId} configFile={configFile} />);
  }

  if (projectIdUpdated) {
    // This should always be set when we succeed
    if (!configFile) throw new Error(`Missing config file after configuration success`);

    return withProviders(
      <LinkedProject
        projectId={projectId}
        configFile={configFile}
        goToNext={clearProjectIdUpdated}
      />
    );
  }

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
