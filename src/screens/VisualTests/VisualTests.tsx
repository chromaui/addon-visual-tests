import { useStorybookApi } from "@storybook/manager-api";
import type { API_StatusState } from "@storybook/types";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { getFragment } from "../../gql";
import {
  AddonVisualTestsBuildQuery,
  AddonVisualTestsBuildQueryVariables,
  ReviewTestBatch,
  ReviewTestInputStatus,
  TestStatus,
} from "../../gql/graphql";
import { GitInfoPayload, RunningBuildPayload, UpdateStatusFunction } from "../../types";
import { statusMap, testsToStatusUpdate } from "../../utils/testsToStatusUpdate";
import { StoryBuildInfo, updateStoryBuildInfo } from "../../utils/updateStoryBuildInfo";
import { BuildResults } from "./BuildResults";
import {
  FragmentNextBuildFields,
  FragmentNextStoryTestFields,
  FragmentStatusTestFields,
  FragmentStoryBuildFields,
  MutationReviewTest,
  QueryBuild,
} from "./graphql";
import { NoBuild } from "./NoBuild";

const createEmptyStoryStatusUpdate = (state: API_StatusState) => {
  return Object.fromEntries(Object.entries(state).map(([id, update]) => [id, null]));
};

interface VisualTestsProps {
  projectId: string;
  gitInfo: Pick<
    GitInfoPayload,
    "branch" | "slug" | "userEmailHash" | "committedAt" | "uncommittedHash"
  >;
  runningBuild?: RunningBuildPayload;
  startDevBuild: () => void;
  setAccessToken: (accessToken: string | null) => void;
  setOutdated: (isOutdated: boolean) => void;
  updateBuildStatus: UpdateStatusFunction;
  storyId: string;
}

export const VisualTests = ({
  runningBuild,
  startDevBuild,
  setAccessToken,
  setOutdated,
  updateBuildStatus,
  projectId,
  gitInfo,
  storyId,
}: VisualTestsProps) => {
  const { addNotification } = useStorybookApi();

  // The storyId and buildId that drive the test(s) we are currently looking at
  // The user can choose when to change story (via sidebar) and build (via opting into new builds)
  const [storyBuildInfo, setStoryBuildInfo] = useState<StoryBuildInfo>({ storyId });

  const [{ data, error, operation }, rerun] = useQuery<
    AddonVisualTestsBuildQuery,
    AddonVisualTestsBuildQueryVariables
  >({
    query: QueryBuild,
    variables: {
      projectId,
      storyId,
      testStatuses: Object.keys(statusMap) as any as TestStatus[],
      branch: gitInfo.branch || "",
      ...(gitInfo.slug ? { slug: gitInfo.slug } : {}),
      gitUserEmailHash: gitInfo.userEmailHash,
      storyBuildId: storyBuildInfo?.buildId || "",
      hasStoryBuildId: !!storyBuildInfo?.buildId,
    },
  });

  // When you change story, for a period the query will return the previous set of data, and indicate
  // that with the operation being for the previous query.
  const storyDataIsStale =
    operation && storyBuildInfo?.storyId && operation.variables.storyId !== storyBuildInfo.storyId;

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(rerun, 5000);
    return () => clearInterval(interval);
  }, [rerun]);

  const { userCanReview } = data?.viewer?.projectMembership || {};

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
        rerun();
      } catch (err) {
        addNotification({
          id: "chromatic/errorAccepting",
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
    },
    [addNotification, rerun, reviewTest]
  );

  const onAccept = useCallback(
    async (testId: string, batch: ReviewTestBatch) =>
      onReview(ReviewTestInputStatus.Accepted, testId, batch),
    [onReview]
  );

  const onUnaccept = useCallback(
    async (testId: string) => onReview(ReviewTestInputStatus.Pending, testId),
    [onReview]
  );

  const nextBuild = getFragment(FragmentNextBuildFields, data?.project?.nextBuild);

  const nextStoryTests = [
    ...getFragment(
      FragmentNextStoryTestFields,
      nextBuild && "testsForStory" in nextBuild ? nextBuild.testsForStory.nodes : []
    ),
  ];
  const nextBuildCompletedStory =
    nextBuild && nextStoryTests.every(({ status }) => status !== TestStatus.InProgress);

  // Before we set the storyInfo, we use the nextBuild for story data if it's ready
  const storyBuild = getFragment(
    FragmentStoryBuildFields,
    data?.storyBuild ?? (nextBuildCompletedStory && data?.project?.nextBuild)
  );

  // Currently only used by the sidebar button to show a blue dot ("build outdated")
  const isOutdated = storyBuild?.uncommittedHash !== gitInfo.uncommittedHash;
  useEffect(() => setOutdated(isOutdated), [isOutdated, setOutdated]);

  // If the next build is *newer* than the current commit, we don't want to switch to the build
  const nextBuildNewer = nextBuild && nextBuild.committedAt > gitInfo.committedAt;
  const canSwitchToNextBuild = nextBuild && !nextBuildNewer;

  // We always set status to the next build's status, as when we change to a new story we'll see
  // the next builds
  const testsForStatus =
    nextBuild &&
    "testsForStatus" in nextBuild &&
    getFragment(FragmentStatusTestFields, nextBuild.testsForStatus.nodes);

  const buildStatusUpdate =
    canSwitchToNextBuild && testsForStatus && testsToStatusUpdate(testsForStatus);

  useEffect(() => {
    updateBuildStatus((state) => ({
      ...createEmptyStoryStatusUpdate(state),
      ...buildStatusUpdate,
    }));
    // We use the stringified version of buildStatusUpdate to do a deep diff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(buildStatusUpdate), updateBuildStatus]);

  const shouldSwitchToNextBuild = canSwitchToNextBuild && nextBuildCompletedStory;
  // Ensure we are holding the right story build
  useEffect(() => {
    setStoryBuildInfo((oldStoryBuildInfo) =>
      updateStoryBuildInfo(oldStoryBuildInfo, {
        shouldSwitchToNextBuild,
        nextBuildId: nextBuild?.id,
        storyId,
      })
    );
  }, [shouldSwitchToNextBuild, nextBuild?.id, storyId]);

  const switchToNextBuild = useCallback(
    () => canSwitchToNextBuild && setStoryBuildInfo({ storyId, buildId: nextBuild.id }),
    [canSwitchToNextBuild, nextBuild?.id, storyId]
  );

  const isRunningBuildStarting =
    runningBuild && !["success", "error"].includes(runningBuild.currentStep);

  return !storyBuild || storyDataIsStale || error ? (
    <NoBuild
      {...{
        error,
        hasData: !!data && !storyDataIsStale,
        hasStoryBuild: !!storyBuild,
        startDevBuild,
        isRunningBuildStarting,
        branch: gitInfo.branch,
        setAccessToken,
      }}
    />
  ) : (
    <BuildResults
      {...{
        branch: gitInfo.branch,
        runningBuild,
        nextBuild,
        nextBuildCompletedStory,
        switchToNextBuild: canSwitchToNextBuild && switchToNextBuild,
        startDevBuild,
        userCanReview,
        isReviewing,
        onAccept,
        onUnaccept,
        storyBuild,
        setAccessToken,
      }}
    />
  );
};
