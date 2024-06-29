import { FailedIcon } from "@storybook/icons";
import { useStorybookApi, useStorybookState } from "@storybook/manager-api";
import { color } from "@storybook/theming";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect } from "react";
import { useMutation } from "urql";

import { PANEL_ID } from "../../constants";
import { getFragment, graphql } from "../../gql";
import {
  ReviewTestBatch,
  ReviewTestInputStatus,
  TestResult,
  TestStatus,
  VtaOnboardingPreference,
} from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "../../types";
import { testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { SelectedBuildInfo, updateSelectedBuildInfo } from "../../utils/updateSelectedBuildInfo";
import { useSessionState } from "../../utils/useSessionState";
import { AccountSuspended } from "../Errors/AccountSuspended";
import { VisualTestsDisabled } from "../Errors/VisualTestsDisabled";
import { GuidedTour } from "../GuidedTour/GuidedTour";
import { Onboarding } from "../Onboarding/Onboarding";
import { BuildProvider, useBuild } from "./BuildContext";
import { BuildResults } from "./BuildResults";
import { FragmentStatusTestFields, MutationReviewTest } from "./graphql";
import { NoBuild } from "./NoBuild";
import { ReviewTestProvider } from "./ReviewTestContext";

const createEmptyStoryStatusUpdate = (state: API_StatusState) => {
  return Object.fromEntries(Object.entries(state).map(([id]) => [id, null]));
};

interface VisualTestsProps {
  isOutdated: boolean;
  selectedBuildInfo?: SelectedBuildInfo;
  setSelectedBuildInfo: ReturnType<typeof useSessionState<SelectedBuildInfo | undefined>>[1];
  dismissBuildError: () => void;
  localBuildProgress?: LocalBuildProgress;
  setOutdated: (isOutdated: boolean) => void;
  updateBuildStatus: UpdateStatusFunction;
  projectId: string;
  gitInfo: Pick<
    GitInfoPayload,
    "branch" | "slug" | "userEmailHash" | "commit" | "committedAt" | "uncommittedHash"
  >;
  storyId: string;
}

interface ReviewTestInput {
  testId: string;
  status: ReviewTestInputStatus.Accepted | ReviewTestInputStatus.Pending;
  batch?: ReviewTestBatch;
}

const useReview = ({
  buildIsReviewable,
  userCanReview,
  onReviewSuccess,
  onReviewError,
}: {
  buildIsReviewable: boolean;
  userCanReview: boolean;
  onReviewSuccess?: (input: ReviewTestInput) => void;
  onReviewError?: (err: any, input: ReviewTestInput) => void;
}) => {
  const [{ fetching: isReviewing }, runMutation] = useMutation(MutationReviewTest);

  const reviewTest = useCallback(
    async (input: ReviewTestInput) => {
      try {
        if (!buildIsReviewable) throw new Error("Build is not reviewable");
        if (!userCanReview) throw new Error("No permission to review tests");
        const { error } = await runMutation({ input });
        if (error) throw error;
        onReviewSuccess?.(input);
      } catch (err) {
        onReviewError?.(err, input);
      }
    },
    [onReviewSuccess, onReviewError, runMutation, buildIsReviewable, userCanReview]
  );

  const acceptTest = useCallback(
    (testId: string, batch: ReviewTestBatch = ReviewTestBatch.Spec) =>
      reviewTest({ status: ReviewTestInputStatus.Accepted, testId, batch }),
    [reviewTest]
  );

  const unacceptTest = useCallback(
    (testId: string, batch: ReviewTestBatch = ReviewTestBatch.Spec) =>
      reviewTest({ status: ReviewTestInputStatus.Pending, testId, batch }),
    [reviewTest]
  );

  return { isReviewing, acceptTest, unacceptTest, buildIsReviewable, userCanReview };
};

const MutationUpdateUserPreferences = graphql(/* GraphQL */ `
  mutation UpdateUserPreferences($input: UserPreferencesInput!) {
    updateUserPreferences(input: $input) {
      updatedPreferences {
        vtaOnboarding
      }
    }
  }
`);

const useOnboarding = ({ lastBuildOnBranch, vtaOnboarding }: ReturnType<typeof useBuild>) => {
  const managerApi = useStorybookApi();
  const { notifications, storyId } = useStorybookState();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const completeOnboarding = React.useCallback(() => {
    setHasCompletedOnboarding(true);
    notifications.forEach(({ id }) => managerApi.clearNotification(id));
  }, [managerApi, notifications]);

  const [walkthroughInProgress, setWalkthroughInProgress] = React.useState(false);
  const startWalkthrough = React.useCallback(() => setWalkthroughInProgress(true), []);

  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = React.useState(true);
  React.useEffect(() => {
    // Force the onboarding to show by adding ?vtaOnboarding=true to the URL
    if (managerApi?.getUrlState?.().queryParams.vtaOnboarding === "true") {
      setHasCompletedWalkthrough(false);
      return;
    }
    if (vtaOnboarding) {
      setHasCompletedWalkthrough(
        vtaOnboarding === VtaOnboardingPreference.Completed ||
          vtaOnboarding === VtaOnboardingPreference.Dismissed
      );
    }
  }, [managerApi, vtaOnboarding]);

  const [{ fetching: isUpdating }, runMutation] = useMutation(MutationUpdateUserPreferences);

  const exitWalkthrough = React.useCallback(
    async (completed: boolean) => {
      const preference = completed
        ? VtaOnboardingPreference.Completed
        : VtaOnboardingPreference.Dismissed;
      await runMutation({ input: { vtaOnboarding: preference } });

      setHasCompletedWalkthrough(true);
      setWalkthroughInProgress(false);

      const url = new URL(window.location.href);
      if (url.searchParams.has("vtaOnboarding")) {
        url.searchParams.delete("vtaOnboarding");
        window.history.replaceState({}, "", url.href);
      }
    },
    [runMutation]
  );

  const lastBuildHasChangesForStory = React.useMemo(() => {
    // select only testsForStatus (or empty array) and return true if any of them are pending and changed
    const testsForStatus =
      (lastBuildOnBranch &&
        "testsForStatus" in lastBuildOnBranch &&
        lastBuildOnBranch.testsForStatus?.nodes &&
        getFragment(FragmentStatusTestFields, lastBuildOnBranch.testsForStatus.nodes)) ||
      [];

    return testsForStatus.some(
      (t) =>
        t?.status === TestStatus.Pending &&
        t?.result === TestResult.Changed &&
        t?.story?.storyId === storyId
    );
  }, [lastBuildOnBranch, storyId]);

  const showOnboarding =
    !hasCompletedOnboarding && !hasCompletedWalkthrough && !walkthroughInProgress;

  return {
    showOnboarding,
    showGuidedTour: !showOnboarding && !hasCompletedWalkthrough,
    completeOnboarding,
    skipOnboarding: React.useCallback(() => exitWalkthrough(false), [exitWalkthrough]),
    completeWalkthrough: React.useCallback(() => exitWalkthrough(true), [exitWalkthrough]),
    skipWalkthrough: React.useCallback(() => exitWalkthrough(false), [exitWalkthrough]),
    startWalkthrough,
    lastBuildHasChangesForStory,
    isUpdating,
  };
};

export const VisualTestsWithoutSelectedBuildId = ({
  isOutdated,
  selectedBuildInfo,
  setSelectedBuildInfo,
  dismissBuildError,
  localBuildProgress,
  setOutdated,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
  const managerApi = useStorybookApi();
  const { addNotification, setOptions, togglePanel } = managerApi;
  const buildInfo = useBuild({ projectId, storyId, gitInfo, selectedBuildInfo });

  const {
    account,
    features,
    manageUrl,
    hasData,
    hasProject,
    hasSelectedBuild,
    lastBuildOnBranch,
    lastBuildOnBranchIsReady,
    lastBuildOnBranchIsSelectable,
    selectedBuild,
    selectedBuildMatchesGit,
    queryError,
    rerunQuery,
    userCanReview,
  } = buildInfo;

  const clickNotification = useCallback(
    ({ onDismiss }) => {
      onDismiss();
      setOptions({ selectedPanel: PANEL_ID });
      togglePanel(true);
    },
    [setOptions, togglePanel]
  );

  const reviewState = useReview({
    buildIsReviewable: !!selectedBuild && selectedBuild.id === lastBuildOnBranch?.id,
    userCanReview,
    onReviewSuccess: rerunQuery,
    onReviewError: (err, update) => {
      if (err instanceof Error) {
        addNotification({
          id: "chromatic/errorAccepting",
          content: {
            headline: `Failed to ${
              update.status === ReviewTestInputStatus.Accepted ? "accept" : "unaccept"
            } changes`,
            subHeadline: err.message,
          },
          icon: <FailedIcon color={color.negative} />,
          // @ts-expect-error `duration` and `onClick` require a newer version of Storybook
          duration: 8_000,
          onClick: clickNotification,
        });
      }
    },
  });

  // Currently only used by the sidebar button to show a blue dot ("build outdated")
  useEffect(() => setOutdated(!selectedBuildMatchesGit), [selectedBuildMatchesGit, setOutdated]);

  // We always set status to the next build's status, as when we change to a new story we'll see the
  // next builds. The status update is calculated outside useEffect so it only reruns when changed.
  const testsForStatus =
    lastBuildOnBranch &&
    "testsForStatus" in lastBuildOnBranch &&
    lastBuildOnBranch.testsForStatus?.nodes &&
    getFragment(FragmentStatusTestFields, lastBuildOnBranch.testsForStatus.nodes);
  const statusUpdate = lastBuildOnBranchIsSelectable && testsToStatusUpdate(testsForStatus || []);
  useEffect(() => {
    updateBuildStatus((state) => ({
      ...createEmptyStoryStatusUpdate(state),
      ...statusUpdate,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(statusUpdate), updateBuildStatus]);

  // Auto-select the last build on branch if it's selectable and ready
  useEffect(() => {
    setSelectedBuildInfo((oldSelectedBuildInfo) =>
      updateSelectedBuildInfo(oldSelectedBuildInfo, {
        shouldSwitchToLastBuildOnBranch: lastBuildOnBranchIsSelectable && lastBuildOnBranchIsReady,
        lastBuildOnBranchId: lastBuildOnBranch?.id,
        storyId,
      })
    );
  }, [
    lastBuildOnBranchIsSelectable,
    lastBuildOnBranchIsReady,
    lastBuildOnBranch?.id,
    setSelectedBuildInfo,
    storyId,
  ]);

  const switchToLastBuildOnBranch = useCallback(
    () =>
      lastBuildOnBranch?.id &&
      lastBuildOnBranchIsSelectable &&
      setSelectedBuildInfo({ buildId: lastBuildOnBranch.id, storyId }),
    [setSelectedBuildInfo, lastBuildOnBranchIsSelectable, lastBuildOnBranch?.id, storyId]
  );

  const {
    showOnboarding,
    showGuidedTour,
    completeOnboarding,
    completeWalkthrough,
    skipOnboarding,
    skipWalkthrough,
    startWalkthrough,
    lastBuildHasChangesForStory,
  } = useOnboarding(buildInfo);

  if (features && !features.uiTests) {
    return <VisualTestsDisabled manageUrl={manageUrl} />;
  }

  if (account?.suspensionReason) {
    return (
      <AccountSuspended
        billingUrl={account.billingUrl}
        suspensionReason={account.suspensionReason}
      />
    );
  }

  if (showOnboarding && hasProject) {
    return (
      <>
        {/* Don't render onboarding until data has loaded to allow initial build logic ot work. */}
        {!hasData || queryError ? (
          <></>
        ) : (
          <BuildProvider watchState={buildInfo}>
            <Onboarding
              {...{
                gitInfo,
                projectId,
                updateBuildStatus,
                dismissBuildError,
                localBuildProgress,
                showInitialBuildScreen: !selectedBuild,
                onComplete: completeOnboarding,
                onSkip: skipOnboarding,
                lastBuildHasChangesForStory,
              }}
            />
          </BuildProvider>
        )}
      </>
    );
  }

  return (
    <>
      {!selectedBuild || !hasSelectedBuild || !hasData || queryError ? (
        <NoBuild
          {...{
            queryError,
            hasData,
            hasProject,
            hasSelectedBuild,
            branch: gitInfo.branch,
            dismissBuildError,
            isOutdated,
            localBuildProgress,
            ...(lastBuildOnBranchIsSelectable && { switchToLastBuildOnBranch }),
          }}
        />
      ) : (
        <ReviewTestProvider watchState={reviewState}>
          <BuildProvider watchState={buildInfo}>
            <BuildResults
              {...{
                branch: gitInfo.branch,
                dismissBuildError,
                isOutdated,
                localBuildProgress,
                ...(lastBuildOnBranch && { lastBuildOnBranch }),
                ...(lastBuildOnBranchIsSelectable && { switchToLastBuildOnBranch }),
                userCanReview,
                storyId,
              }}
            />
          </BuildProvider>
        </ReviewTestProvider>
      )}
      {showGuidedTour && (
        <BuildProvider watchState={{ selectedBuild }}>
          <GuidedTour
            managerApi={managerApi}
            skipWalkthrough={skipWalkthrough}
            startWalkthrough={startWalkthrough}
            completeWalkthrough={completeWalkthrough}
          />
        </BuildProvider>
      )}
    </>
  );
};

// We split this part of the component out for testing purposes, so we can control the
// selected build id in the stories and be super explicit about what happens when the
// selected build & last build on branch are out of sync.
//
// If the selectedBuildInfo is internal state of the component it is harder to do this,
// as we need to change the query results over time.
export const VisualTests = (
  props: Omit<VisualTestsProps, "selectedBuildInfo" | "setSelectedBuildInfo">
) => {
  const [selectedBuildInfo, setSelectedBuildInfo] = useSessionState<SelectedBuildInfo | undefined>(
    "selectedBuildInfo"
  );

  return (
    <VisualTestsWithoutSelectedBuildId {...{ selectedBuildInfo, setSelectedBuildInfo, ...props }} />
  );
};
