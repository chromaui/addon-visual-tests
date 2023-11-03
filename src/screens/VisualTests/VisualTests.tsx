import { useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { getFragment } from "../../gql";
import { ReviewTestBatch, ReviewTestInputStatus, TestStatus } from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress, UpdateStatusFunction } from "../../types";
import { statusMap, testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { SelectedBuildInfo, updateSelectedBuildInfo } from "../../utils/updateSelectedBuildInfo";
import { BuildResults } from "./BuildResults";
import {
  FragmentLastBuildOnBranchBuildFields,
  FragmentLastBuildOnBranchTestFields,
  FragmentSelectedBuildFields,
  FragmentStatusTestFields,
  MutationReviewTest,
  QueryBuild,
} from "./graphql";
import { NoBuild } from "./NoBuild";
import { ReviewTestProvider } from "./ReviewTestContext";
import { SelectedBuildProvider } from "./SelectedBuildContext";

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

const useBuild = ({
  projectId,
  storyId,
  gitInfo,
  selectedBuildInfo,
}: {
  projectId: string;
  storyId: string;
  gitInfo: Pick<
    GitInfoPayload,
    "branch" | "slug" | "userEmailHash" | "commit" | "committedAt" | "uncommittedHash"
  >;
  selectedBuildInfo?: SelectedBuildInfo;
}) => {
  const [{ data, error: queryError, operation }, rerunQuery] = useQuery({
    query: QueryBuild,
    variables: {
      projectId,
      storyId,
      testStatuses: Object.keys(statusMap) as any as TestStatus[],
      branch: gitInfo.branch || "",
      ...(gitInfo.slug ? { slug: gitInfo.slug } : {}),
      gitUserEmailHash: gitInfo.userEmailHash,
      selectedBuildId: selectedBuildInfo?.buildId || "",
      hasSelectedBuildId: !!selectedBuildInfo,
    },
  });

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerunQuery, 5000);
    return () => clearInterval(interval);
  }, [rerunQuery]);

  // When you change story, for a period the query will return the previous set of data, and indicate
  // that with the operation being for the previous query.
  const storyDataIsStale = operation && storyId && operation.variables.storyId !== storyId;

  const lastBuildOnBranch = getFragment(
    FragmentLastBuildOnBranchBuildFields,
    data?.project?.lastBuildOnBranch
  );

  const lastBuildOnBranchStoryTests = [
    ...getFragment(
      FragmentLastBuildOnBranchTestFields,
      lastBuildOnBranch && "testsForStory" in lastBuildOnBranch && lastBuildOnBranch.testsForStory
        ? lastBuildOnBranch.testsForStory.nodes
        : []
    ),
  ];

  // If the last build is *newer* than the current head commit, we don't want to select it
  // as our local code wouldn't yet have the changes made in that build.
  const lastBuildOnBranchIsNewer = lastBuildOnBranch?.committedAt > gitInfo.committedAt;
  const lastBuildOnBranchIsSelectable = !!lastBuildOnBranch && !lastBuildOnBranchIsNewer;

  // If any tests for the current story are still in progress, we aren't ready to select the build
  const lastBuildOnBranchIsReady =
    !!lastBuildOnBranch &&
    lastBuildOnBranchStoryTests.every((t) => t.status !== TestStatus.InProgress);

  // If we didn't explicitly select a build, select the last build on the branch (if any)
  const selectedBuild = getFragment(
    FragmentSelectedBuildFields,
    data?.selectedBuild ?? (lastBuildOnBranchIsReady ? data?.project?.lastBuildOnBranch : undefined)
  );

  return {
    hasData: !!data && !storyDataIsStale,
    hasProject: !!data?.project,
    hasSelectedBuild: selectedBuild?.branch === gitInfo.branch,
    lastBuildOnBranch,
    lastBuildOnBranchIsNewer,
    lastBuildOnBranchIsReady,
    lastBuildOnBranchIsSelectable,
    selectedBuild,
    selectedBuildMatchesGit:
      selectedBuild?.branch === gitInfo.branch &&
      selectedBuild?.commit === gitInfo.commit &&
      selectedBuild?.uncommittedHash === gitInfo.uncommittedHash,
    rerunQuery,
    queryError,
    userCanReview: !!data?.viewer?.projectMembership?.userCanReview,
  };
};

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
  } = useBuild({
    projectId,
    storyId,
    gitInfo,
    selectedBuildInfo,
  });

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
      <SelectedBuildProvider watchState={selectedBuild}>
        <BuildResults
          {...{
            branch: gitInfo.branch,
            dismissBuildError,
            localBuildProgress,
            ...(lastBuildOnBranch && { lastBuildOnBranch }),
            lastBuildOnBranchIsReady,
            ...(lastBuildOnBranchIsSelectable && { switchToLastBuildOnBranch }),
            startDevBuild,
            setAccessToken,
            storyId,
          }}
        />
      </SelectedBuildProvider>
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
