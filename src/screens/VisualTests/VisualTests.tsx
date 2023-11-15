import { useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "urql";

import { getFragment } from "../../gql";
import { ReviewTestBatch, ReviewTestInputStatus } from "../../gql/graphql";
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

export const VisualTestsWithoutSelectedBuildId = ({
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

  // TODO: We probably want users to see the onboarding at least once, even if the project does have a lastBuild.
  // TODO: Include and check !hasOnboardedVTAddon flag on the user object so that it can be shown to everyone.

  const [shouldShowInitalOnboarding, setShouldShowInitialOnboarding] = useState(false);
  useEffect(() => {
    console.log("setting shouldShowInitialOnboarding", !lastBuildOnBranch, {
      lastBuildOnBranch,
      lastBuildOnBranchIsReady,
    });
    setShouldShowInitialOnboarding(!lastBuildOnBranch || !lastBuildOnBranchIsReady);
  }, [lastBuildOnBranch, lastBuildOnBranchIsReady]);

  // This behaviour should be dynamic, but for now we'll just show it to everyone
  // TODO: Set shouldShowGuidedTour by user's tour status (or a query param) and if there is a build with changes
  const [shouldShowGuidedTour, setShouldShowGuidedTour] = useState(false);
  useEffect(() => {
    console.log("setting shouldShowGuidedTour", !!(lastBuildOnBranch && lastBuildOnBranchIsReady), {
      lastBuildOnBranch,
      lastBuildOnBranchIsReady,
    });
    const buildExistsForBranch = !!(lastBuildOnBranch && lastBuildOnBranchIsReady);
    if (buildExistsForBranch) {
      // managerApi.togglePanel(true);
      // managerApi.togglePanelPosition("right");
      // managerApi.setSelectedPanel("addon-visual-tests");
      setShouldShowGuidedTour(true);
    }
  }, [lastBuildOnBranch, lastBuildOnBranchIsReady]);

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
    // @ts-expect-error The return type of this function is wrong in the API, it should allow `null` values
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

  // TODO: This should just show along with the guided tour, right?
  if (shouldShowInitalOnboarding) {
    return (
      <Onboarding
        {...{
          gitInfo,
          projectId,
          setAccessToken,
          startDevBuild,
          updateBuildStatus,
          localBuildProgress,
          onCompleteOnboarding: () => {
            setShouldShowInitialOnboarding(false);
            setShouldShowGuidedTour(true);
            // TODO: Use a mutation to set a flag `hasOnboardedVTAddon. Similar to the `hasOnboarded` flag in Chromatic webapp
          },
        }}
      />
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
            startDevBuild,
            localBuildProgress,
            branch: gitInfo.branch,
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
      {shouldShowGuidedTour && <GuidedTour api={managerApi} />}
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
