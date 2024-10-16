import { Link } from "@storybook/components";
import { FailedIcon } from "@storybook/icons";
import { addons, type API, useChannel, useStorybookState } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import { Addon_TestProviderState, Addon_TestProviderType, Addon_TypesEnum } from "@storybook/types";
import pluralize from "pluralize";
import React, { useCallback, useContext, useEffect, useRef } from "react";

import { BUILD_STEP_CONFIG } from "./buildSteps";
import { SidebarBottom } from "./components/SidebarBottom";
import { SidebarTop } from "./components/SidebarTop";
import {
  ADDON_ID,
  CONFIG_INFO,
  GIT_INFO_ERROR,
  IS_OFFLINE,
  IS_OUTDATED,
  LOCAL_BUILD_PROGRESS,
  PANEL_ID,
  PARAM_KEY,
  SIDEBAR_BOTTOM_ID,
  SIDEBAR_TOP_ID,
  TEST_PROVIDER_ID,
  TESTING_MODULE_CANCEL_TEST_RUN_REQUEST,
  TESTING_MODULE_RUN_ALL_REQUEST,
} from "./constants";
import { Panel } from "./Panel";
import { ConfigInfoPayload, LocalBuildProgress } from "./types";
import { useAccessToken } from "./utils/graphQLClient";
import { TelemetryContext } from "./utils/TelemetryContext";
import { useBuildEvents } from "./utils/useBuildEvents";
import { useProjectId } from "./utils/useProjectId";
import { useSharedState } from "./utils/useSharedState";

let heartbeatTimeout: NodeJS.Timeout;
const expectHeartbeat = (api: API) => {
  heartbeatTimeout = setTimeout(() => expectHeartbeat(api), 30000);
};

type DescriptionProps = Addon_TestProviderState & { api: API };

const Description = ({ api, running }: DescriptionProps) => {
  const { addNotification, selectStory, setOptions, togglePanel } = api;

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
  const { index, status, storyId, viewMode } = useStorybookState();
  const changedStoryCount = Object.values(status).filter(
    (value) => value[ADDON_ID]?.status === "warn"
  );

  const openVisualTestsPanel = useCallback(
    (warning?: string) => {
      setOptions({ selectedPanel: PANEL_ID });
      togglePanel(true);
      if (index && viewMode !== "story") {
        // Select the next story in the index, because docs mode doesn't show addon panels
        const currentIndex = Object.keys(index).indexOf(storyId);
        const entries = Object.entries(index).slice(currentIndex > 0 ? currentIndex : 0);
        const [nextStoryId] = entries.find(([, { type }]) => type === "story") || [];
        if (nextStoryId) selectStory(nextStoryId);
      }
      if (warning) {
        trackEvent?.({ action: "openWarning", warning });
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
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, [setOffline]);

  useEffect(() => {
    if (localBuildProgress?.currentStep === lastStep.current) return;
    lastStep.current = localBuildProgress?.currentStep;

    if (localBuildProgress?.currentStep === "error") {
      addNotification({
        id: `${ADDON_ID}/build-error/${Date.now()}`,
        content: {
          headline: "Build error",
          subHeadline: "Check the Storybook process on the command line for more details.",
        },
        icon: <FailedIcon color={color.negative} />,
        onClick: clickNotification,
      });
    }

    if (localBuildProgress?.currentStep === "limited") {
      addNotification({
        id: `${ADDON_ID}/build-limited/${Date.now()}`,
        content: {
          headline: "Build limited",
          subHeadline:
            "Your account has insufficient snapshots remaining to run this build. Visit your billing page to find out more.",
        },
        icon: <FailedIcon color={color.negative} />,
        onClick: clickNotification,
      });
    }
  }, [addNotification, clickNotification, localBuildProgress?.currentStep]);

  const { startBuild, stopBuild } = useBuildEvents({
    localBuildProgress,
    accessToken,
  });

  let warning: string | undefined;
  if (!projectId) warning = "Select a project";
  if (!isLoggedIn) warning = "Login required";
  if (gitInfoError) warning = "Git synchronization problem";
  if (hasConfigProblem) warning = "Configuration problem";
  if (isOffline) warning = "Not available while offline";

  const clickWarning = useCallback(
    () => openVisualTestsPanel(warning),
    [openVisualTestsPanel, warning]
  );

  useChannel(
    {
      [TESTING_MODULE_RUN_ALL_REQUEST]: ({ providerId }) => {
        if (providerId === TEST_PROVIDER_ID) startBuild();
      },
      [TESTING_MODULE_CANCEL_TEST_RUN_REQUEST]: ({ providerId }) => {
        if (providerId === TEST_PROVIDER_ID) stopBuild();
      },
    },
    [startBuild, stopBuild]
  );

  if (warning) {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <Link onClick={clickWarning}>{warning}</Link>;
  }
  if (running) {
    if (localBuildProgress) {
      const { renderProgress } = BUILD_STEP_CONFIG[localBuildProgress.currentStep];
      return renderProgress(localBuildProgress);
    }
    return "Starting...";
  }
  if (isOutdated) {
    return "Test results outdated";
  }
  if (localBuildProgress?.currentStep === "aborted") {
    return "Aborted by user";
  }
  if (localBuildProgress?.currentStep === "complete") {
    if (localBuildProgress.errorCount) {
      return `Encountered ${pluralize("component error", localBuildProgress.errorCount, true)}`;
    }
    return changedStoryCount.length
      ? `Found ${pluralize("story", changedStoryCount.length, true)} with ${pluralize(
          "change",
          changedStoryCount.length
        )}`
      : "No visual changes detected";
  }
  return "Not run";
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: Addon_TypesEnum.PANEL,
    title: "Visual tests",
    paramKey: PARAM_KEY,
    match: ({ viewMode }) => viewMode === "story",
    render: ({ active }) => <Panel active={!!active} api={api} />,
  });

  if (globalThis.CONFIG_TYPE !== "DEVELOPMENT") {
    return;
  }

  if (Addon_TypesEnum.experimental_TEST_PROVIDER) {
    addons.add(TEST_PROVIDER_ID, {
      type: Addon_TypesEnum.experimental_TEST_PROVIDER,
      runnable: true,
      title: ({ failed }) => (failed ? "Visual tests didn't complete" : "Visual tests"),
      description: (state) => <Description {...state} api={api} />,
    } as Addon_TestProviderType);
  } else {
    addons.add(SIDEBAR_TOP_ID, {
      type: "sidebar-top" as Addon_TypesEnum.experimental_SIDEBAR_TOP,
      render: () => <SidebarTop api={api} />,
    });

    addons.add(SIDEBAR_BOTTOM_ID, {
      type: "sidebar-bottom" as Addon_TypesEnum.experimental_SIDEBAR_BOTTOM,
      render: () => <SidebarBottom api={api} />,
    });
  }

  const channel = api.getChannel();
  if (!channel) return;

  let notificationId: string | undefined;
  channel.on(`${ADDON_ID}/heartbeat`, () => {
    clearTimeout(heartbeatTimeout);
    if (notificationId) {
      api.clearNotification(notificationId);
      notificationId = undefined;
    }
    heartbeatTimeout = setTimeout(() => {
      notificationId = `${ADDON_ID}/connection-lost/${Date.now()}`;
      api.addNotification({
        id: notificationId,
        content: {
          headline: "Connection lost",
          subHeadline: "Lost connection to the Storybook server. Try refreshing the page.",
        },
        icon: <FailedIcon color={color.negative} />,
        link: undefined,
      });
    }, 3000);
  });
});
