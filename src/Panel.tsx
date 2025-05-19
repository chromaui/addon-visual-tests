import React, { useCallback, useEffect, useState } from 'react';
import type { API } from 'storybook/manager-api';
import { experimental_getStatusStore, useChannel, useStorybookState } from 'storybook/manager-api';

import { AuthProvider } from './AuthContext';
import { Spinner } from './components/design-system';
import {
  ADDON_ID,
  GIT_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  REMOVE_ADDON,
  TELEMETRY,
} from './constants';
import { Authentication } from './screens/Authentication/Authentication';
import { GitNotFound } from './screens/Errors/GitNotFound';
import { LinkedProject } from './screens/LinkProject/LinkedProject';
import { LinkingProjectFailed } from './screens/LinkProject/LinkingProjectFailed';
import { LinkProject } from './screens/LinkProject/LinkProject';
import { NoDevServer } from './screens/NoDevServer/NoDevServer';
import { NoNetwork } from './screens/NoNetwork/NoNetwork';
import { UninstallProvider } from './screens/Uninstalled/UninstallContext';
import { Uninstalled } from './screens/Uninstalled/Uninstalled';
import { ControlsProvider } from './screens/VisualTests/ControlsContext';
import { RunBuildProvider } from './screens/VisualTests/RunBuildContext';
import { VisualTests } from './screens/VisualTests/VisualTests';
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from './types';
import { createClient, GraphQLClientProvider, useAccessToken } from './utils/graphQLClient';
import { TelemetryProvider } from './utils/TelemetryContext';
import { useBuildEvents } from './utils/useBuildEvents';
import { useChannelFetch } from './utils/useChannelFetch';
import { useProjectId } from './utils/useProjectId';
import { clearSessionState, useSessionState } from './utils/useSessionState';
import { useSharedState } from './utils/useSharedState';

interface PanelProps {
  active: boolean;
  api: API;
}

const statusStore = experimental_getStatusStore(ADDON_ID);

export const Panel = ({ active, api }: PanelProps) => {
  const [accessToken, updateAccessToken] = useAccessToken();
  const setAccessToken = useCallback(
    (token: string | null) => {
      updateAccessToken(token);
      if (!token) clearSessionState('authenticationScreen', 'exchangeParameters');
    },
    [updateAccessToken]
  );
  const { storyId } = useStorybookState();

  const [isOnline, setOnline] = useState<boolean>(window.navigator.onLine);
  useEffect(() => {
    const online = () => setOnline(true);
    const offline = () => setOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const [gitInfo] = useSharedState<GitInfoPayload>(GIT_INFO);
  const [gitInfoError] = useSharedState<Error>(GIT_INFO_ERROR);
  const [isOffline] = useSharedState<boolean>(IS_OFFLINE);
  const [isOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const [localBuildProgress, setLocalBuildProgress] =
    useSharedState<LocalBuildProgress>(LOCAL_BUILD_PROGRESS);
  const [, setOutdated] = useSharedState<boolean>(IS_OUTDATED);
  const emit = useChannel({});

  const updateBuildStatus = useCallback<UpdateStatusFunction>(
    (statuses) => {
      statusStore.unset();
      statusStore.set(statuses);
    },
    [statusStore]
  );

  const {
    loading: projectInfoLoading,
    projectId,
    configFile,
    updateProject,
    projectUpdatingFailed,
    projectIdUpdated,
    clearProjectIdUpdated,
  } = useProjectId();

  // If the user creates a project in a dialog (either during login or later, it get set here)
  const [createdProjectId, setCreatedProjectId] = useSessionState<string>('createdProjectId');
  const [addonUninstalled, setAddonUninstalled] = useSharedState<boolean>(REMOVE_ADDON);

  const trackEvent = useCallback((data: any) => emit(TELEMETRY, data), [emit]);
  const { isRunning, startBuild, stopBuild } = useBuildEvents({ localBuildProgress, accessToken });

  const fetch = useChannelFetch();
  const withProviders = (children: React.ReactNode) => (
    <GraphQLClientProvider value={createClient({ fetch })}>
      <TelemetryProvider value={trackEvent}>
        <AuthProvider value={{ accessToken, setAccessToken }}>
          <UninstallProvider
            addonUninstalled={addonUninstalled}
            setAddonUninstalled={setAddonUninstalled}
          >
            <ControlsProvider>
              <RunBuildProvider watchState={{ isRunning, startBuild, stopBuild }}>
                <div hidden={!active} style={{ containerType: 'size', height: '100%' }}>
                  {children}
                </div>
              </RunBuildProvider>
            </ControlsProvider>
          </UninstallProvider>
        </AuthProvider>
      </TelemetryProvider>
    </GraphQLClientProvider>
  );

  if (!active) {
    return withProviders(null);
  }

  if (globalThis.CONFIG_TYPE !== 'DEVELOPMENT') {
    return withProviders(<NoDevServer />);
  }

  if (addonUninstalled) {
    return withProviders(<Uninstalled />);
  }

  if (isOffline) {
    return withProviders(<NoNetwork offline={isOffline} />);
  }

  // Render the Authentication flow if the user is not signed in.
  if (!accessToken) {
    return withProviders(
      <Authentication
        setAccessToken={setAccessToken}
        setCreatedProjectId={setCreatedProjectId}
        hasProjectId={!!projectId}
      />
    );
  }

  if (gitInfoError || !gitInfo) {
    return withProviders(<GitNotFound />);
  }

  // Momentarily wait on addonState (should be very fast)
  if (projectInfoLoading) {
    return active ? <Spinner /> : null;
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

  const localBuildIsRightBranch = gitInfo.branch === localBuildProgress?.branch;
  return withProviders(
    <VisualTests
      dismissBuildError={() => setLocalBuildProgress(undefined)}
      isOutdated={!!isOutdated}
      localBuildProgress={localBuildIsRightBranch ? localBuildProgress : undefined}
      setOutdated={setOutdated}
      updateBuildStatus={updateBuildStatus}
      projectId={projectId}
      gitInfo={gitInfo}
      storyId={storyId}
    />
  );
};
