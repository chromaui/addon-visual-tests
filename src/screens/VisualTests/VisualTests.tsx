import { useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { getFragment } from "../../gql";
import {
  ReviewTestBatch,
  ReviewTestInputStatus,
  StoryTestFieldsFragment,
  TestStatus,
} from "../../gql/graphql";
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

const createEmptyStoryStatusUpdate = (state: API_StatusState) => {
  return Object.fromEntries(Object.entries(state).map(([id, update]) => [id, null]));
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

  const [{ data, error: queryError, operation }, rerunQuery] = useQuery({
    query: QueryBuild,
    variables: {
      projectId,
      storyId,
      testStatuses: Object.keys(statusMap) as any as TestStatus[],
      branch: gitInfo.branch || "",
      ...(gitInfo.slug ? { repositoryOwnerName: gitInfo.slug.split("/", 1)[0] } : {}),
      gitUserEmailHash: gitInfo.userEmailHash,
      selectedBuildId: selectedBuildInfo?.buildId || "",
      hasSelectedBuildId: !!selectedBuildInfo,
    },
  });

  // When you change story, for a period the query will return the previous set of data, and indicate
  // that with the operation being for the previous query.
  const storyDataIsStale = operation && storyId && operation.variables.storyId !== storyId;

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerunQuery, 5000);
    return () => clearInterval(interval);
  }, [rerunQuery]);

  const { userCanReview = false } = data?.viewer?.projectMembership || {};

  const [{ fetching: isReviewing }, reviewTest] = useMutation(MutationReviewTest);

  const onReview = useCallback(
    async (
      status: ReviewTestInputStatus.Accepted | ReviewTestInputStatus.Pending,
      testId: string,
      batch?: ReviewTestBatch
    ) => {
      try {
        const { error: reviewError } = await reviewTest({
          input: { testId, status, batch },
        });

        if (reviewError) {
          throw reviewError;
        }
        rerunQuery();
      } catch (err) {
        if (err instanceof Error) {
          addNotification({
            id: "chromatic/errorAccepting",
            // @ts-expect-error we need a better API for not passing a link
            link: undefined,
            content: {
              headline: `Failed to ${
                status === ReviewTestInputStatus.Accepted ? "accept" : "unaccept"
              } changes`,
              subHeadline: err.message,
            },
            icon: {
              name: "cross",
              color: "red",
            },
          });
        }
      }
    },
    [addNotification, rerunQuery, reviewTest]
  );

  const onAccept = useCallback(
    async (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) =>
      onReview(ReviewTestInputStatus.Accepted, testId, batch),
    [onReview]
  );

  const onUnaccept = useCallback(
    async (testId: string) => onReview(ReviewTestInputStatus.Pending, testId),
    [onReview]
  );

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
  const lastBuildOnBranchCompletedStory =
    !!lastBuildOnBranch &&
    lastBuildOnBranchStoryTests.every(({ status }) => status !== TestStatus.InProgress);

  // Before we set the storyInfo, we use the lastBuildOnBranch for story data if it's ready
  const selectedBuild = getFragment(
    FragmentSelectedBuildFields,
    data?.selectedBuild ??
      (lastBuildOnBranchCompletedStory ? data?.project?.lastBuildOnBranch : undefined)
  );

  const selectedBuildHasCorrectBranch = selectedBuild?.branch === gitInfo.branch;
  // Currently only used by the sidebar button to show a blue dot ("build outdated")
  const isOutdated =
    !selectedBuildHasCorrectBranch ||
    selectedBuild?.commit !== gitInfo.commit ||
    selectedBuild?.uncommittedHash !== gitInfo.uncommittedHash;
  useEffect(() => setOutdated(isOutdated), [isOutdated, setOutdated]);

  // If the next build is *newer* than the current commit, we don't want to switch to the build
  const lastBuildOnBranchNewer =
    lastBuildOnBranch && lastBuildOnBranch.committedAt > gitInfo.committedAt;
  const canSwitchToLastBuildOnBranch = !!lastBuildOnBranch && !lastBuildOnBranchNewer;

  // We always set status to the next build's status, as when we change to a new story we'll see
  // the next builds
  const testsForStatus =
    lastBuildOnBranch &&
    "testsForStatus" in lastBuildOnBranch &&
    lastBuildOnBranch.testsForStatus &&
    getFragment(FragmentStatusTestFields, lastBuildOnBranch.testsForStatus.nodes);

  const buildStatusUpdate =
    canSwitchToLastBuildOnBranch && testsForStatus ? testsToStatusUpdate(testsForStatus) : {};

  useEffect(() => {
    // @ts-expect-error The return type of this function is wrong in the API, it should allow `null` values
    updateBuildStatus((state) => ({
      ...createEmptyStoryStatusUpdate(state),
      ...buildStatusUpdate,
    }));
    // We use the stringified version of buildStatusUpdate to do a deep diff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(buildStatusUpdate), updateBuildStatus]);

  const shouldSwitchToLastBuildOnBranch =
    canSwitchToLastBuildOnBranch && lastBuildOnBranchCompletedStory;

  // Ensure we are holding the right story build
  useEffect(() => {
    setSelectedBuildInfo((oldSelectedBuildInfo) =>
      updateSelectedBuildInfo(oldSelectedBuildInfo, {
        shouldSwitchToLastBuildOnBranch,
        lastBuildOnBranchId: lastBuildOnBranch?.id,
        storyId,
      })
    );
  }, [shouldSwitchToLastBuildOnBranch, lastBuildOnBranch?.id, storyId, setSelectedBuildInfo]);

  const switchToLastBuildOnBranch = useCallback(
    () =>
      canSwitchToLastBuildOnBranch &&
      setSelectedBuildInfo({ buildId: lastBuildOnBranch.id, storyId }),
    [setSelectedBuildInfo, canSwitchToLastBuildOnBranch, lastBuildOnBranch?.id, storyId]
  );

  return !selectedBuildHasCorrectBranch || !selectedBuild || storyDataIsStale || queryError ? (
    <NoBuild
      {...{
        queryError,
        hasData: !!data && !storyDataIsStale,
        hasProject: !!data?.project,
        hasSelectedBuild: !!selectedBuildHasCorrectBranch && !!selectedBuild,
        startDevBuild,
        localBuildProgress,
        branch: gitInfo.branch,
        setAccessToken,
      }}
    />
  ) : (
    <BuildResults
      {...{
        branch: gitInfo.branch,
        dismissBuildError,
        localBuildProgress,
        ...(lastBuildOnBranch && { lastBuildOnBranch }),
        lastBuildOnBranchCompletedStory,
        ...(canSwitchToLastBuildOnBranch && { switchToLastBuildOnBranch }),
        startDevBuild,
        userCanReview,
        isReviewing,
        onAccept,
        onUnaccept,
        ...(selectedBuildHasCorrectBranch && { selectedBuild }),
        setAccessToken,
        storyId,
      }}
    />
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
