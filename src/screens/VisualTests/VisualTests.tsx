import { useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation } from "urql";

import { getFragment } from "../../gql";
import { ReviewTestBatch, ReviewTestInputStatus } from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "../../types";
import { testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { SelectedBuildInfo, updateSelectedBuildInfo } from "../../utils/updateSelectedBuildInfo";
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
  const { addNotification } = useStorybookApi();

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
            headline: `Failed to ${
              update.status === ReviewTestInputStatus.Accepted ? "accept" : "unaccept"
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

  // We always set status to the next build's status, as when we change to a new story we'll see
  // the next builds
  useEffect(() => {
    const testsForStatus =
      lastBuildOnBranch &&
      "testsForStatus" in lastBuildOnBranch &&
      lastBuildOnBranch.testsForStatus?.nodes &&
      getFragment(FragmentStatusTestFields, lastBuildOnBranch.testsForStatus.nodes);

    // @ts-expect-error The return type of this function is wrong in the API, it should allow `null` values
    updateBuildStatus((state) => ({
      ...createEmptyStoryStatusUpdate(state),
      ...testsToStatusUpdate(testsForStatus || []),
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(lastBuildOnBranch), updateBuildStatus]);

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

  return !selectedBuild || !hasSelectedBuild || !hasData || queryError ? (
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
            switchToLastBuildOnBranch,
            startDevBuild,
            setAccessToken,
            storyId,
          }}
        />
      </BuildProvider>
    </ReviewTestProvider>
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
