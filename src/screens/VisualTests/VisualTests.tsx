import { type API, useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "urql";

import { WALKTHROUGH_COMPLETED_KEY } from "../../constants";
import { getFragment } from "../../gql";
import {
  ReviewTestBatch,
  ReviewTestInputStatus,
  Test,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "../../types";
import { testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { SelectedBuildInfo, updateSelectedBuildInfo } from "../../utils/updateSelectedBuildInfo";
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
  setSelectedBuildInfo: ReturnType<typeof useState<SelectedBuildInfo>>[1];
  dismissBuildError: () => void;
  localBuildProgress?: LocalBuildProgress;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
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

const useOnboarding = (
  { lastBuildOnBranch }: ReturnType<typeof useBuild>,
  managerApi?: Pick<API, "getUrlState">
) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const completeOnboarding = React.useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = React.useState(() => {
    // Force the onboarding to show by adding ?vtaOnboarding=true to the URL
    const force = managerApi?.getUrlState?.().queryParams.vtaOnboarding === "true";
    return !force && localStorage.getItem(WALKTHROUGH_COMPLETED_KEY) === "true";
  });

  const [walkthroughInProgress, setWalkthroughInProgress] = React.useState(false);
  const startWalkthrough = React.useCallback(() => {
    setWalkthroughInProgress(true);
  }, []);

  const completeWalkthrough = React.useCallback(() => {
    setHasCompletedWalkthrough(true);
    localStorage.setItem(WALKTHROUGH_COMPLETED_KEY, "true");
    setWalkthroughInProgress(false);
    // remove onboarding query parameter from current url
    const url = new URL(window.location.href);
    url.searchParams.delete("vtaOnboarding");
    window.history.replaceState({}, "", url.href);
  }, []);

  const lastBuildHasChanges = React.useMemo(() => {
    // select only testsForStatus (or empty array) and return true if any of them are pending and changed
    const testsForStatus =
      (lastBuildOnBranch &&
        "testsForStatus" in lastBuildOnBranch &&
        lastBuildOnBranch.testsForStatus?.nodes &&
        getFragment(FragmentStatusTestFields, lastBuildOnBranch.testsForStatus.nodes)) ||
      [];

    return testsForStatus.some(
      (t) => t?.status === TestStatus.Pending && t?.result === TestResult.Changed
    );
  }, [lastBuildOnBranch]);

  const showOnboarding =
    !hasCompletedOnboarding &&
    !hasCompletedWalkthrough &&
    (!lastBuildOnBranch || !lastBuildHasChanges) &&
    !walkthroughInProgress;

  return {
    showOnboarding,
    showGuidedTour: !showOnboarding && !hasCompletedWalkthrough,
    completeOnboarding,
    completeWalkthrough,
    startWalkthrough,
  };
};

export const VisualTestsWithoutSelectedBuildId = ({
  isOutdated,
  selectedBuildInfo,
  setSelectedBuildInfo,
  dismissBuildError,
  localBuildProgress,
  startDevBuild,
  setAccessToken,
  setOutdated,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
  const managerApi = useStorybookApi();
  const { addNotification } = managerApi;
  const buildInfo = useBuild({ projectId, storyId, gitInfo, selectedBuildInfo });

  const {
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

  const reviewState = useReview({
    buildIsReviewable: !!selectedBuild && selectedBuild.id === lastBuildOnBranch?.id,
    userCanReview,
    onReviewSuccess: rerunQuery,
    onReviewError: (err, update) => {
      if (err instanceof Error) {
        addNotification({
          id: "chromatic/errorAccepting",
          // @ts-expect-error we need a better API for not passing a link
          link: undefined,
          content: {
            headline: `Failed to ${update.status === ReviewTestInputStatus.Accepted ? "accept" : "unaccept"
              } changes`,
            subHeadline: err.message,
          },
          icon: {
            name: "cross",
            color: "red",
          },
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
    startWalkthrough,
  } = useOnboarding(buildInfo, managerApi);

  if (showOnboarding) {
    return (
      <BuildProvider watchState={buildInfo}>
        <Onboarding
          {...{
            gitInfo,
            projectId,
            setAccessToken,
            startDevBuild,
            updateBuildStatus,
            localBuildProgress,
            onComplete: completeOnboarding,
            onSkip: completeWalkthrough,
          }}
        />
      </BuildProvider>
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
            startDevBuild,
            setAccessToken,
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
                startDevBuild,
                userCanReview,
                setAccessToken,
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
            skipWalkthrough={completeWalkthrough}
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
  const [selectedBuildInfo, setSelectedBuildInfo] = useState<SelectedBuildInfo>();

  return (
    <VisualTestsWithoutSelectedBuildId {...{ selectedBuildInfo, setSelectedBuildInfo, ...props }} />
  );
};
