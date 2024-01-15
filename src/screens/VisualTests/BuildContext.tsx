import React, { createContext, useEffect, useMemo } from "react";
import { useQuery } from "urql";

import { getFragment } from "../../gql";
import {
  SelectedBuildFieldsFragment,
  StoryTestFieldsFragment,
  TestStatus,
} from "../../gql/graphql";
import { GitInfoPayload } from "../../types";
import { summarizeTests } from "../../utils/summarizeTests";
import { statusMap } from "../../utils/testsToStatusUpdate";
import { SelectedBuildInfo } from "../../utils/updateSelectedBuildInfo";
import { useRequiredContext } from "../../utils/useRequiredContext";
import { useTests } from "../../utils/useTests";
import { useControlsDispatch } from "./ControlsContext";
import {
  FragmentLastBuildOnBranchBuildFields,
  FragmentLastBuildOnBranchTestFields,
  FragmentSelectedBuildFields,
  FragmentStoryTestFields,
  QueryBuild,
} from "./graphql";

export const useBuild = ({
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
      ...(gitInfo.slug ? { repositoryOwnerName: gitInfo.slug.split("/", 1)[0] } : {}),
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

type BuildInfo = ReturnType<typeof useBuild> | null;
type SelectedStory =
  | ({
      hasTests: boolean;
      tests: StoryTestFieldsFragment[];
      summary: ReturnType<typeof summarizeTests>;
    } & ReturnType<typeof useTests>)
  | null;

// Partial allows us to pass only part of the context in some components. This helps prevent unnecessary rerendering of components like GuidedTour.
export const BuildContext = createContext<Partial<BuildInfo> | undefined>(null);
export const StoryContext = createContext<SelectedStory>(null);

export const useBuildState = () => useRequiredContext(BuildContext, "Build");
export const useSelectedBuildState = () => {
  const { selectedBuild } = useRequiredContext(BuildContext, "Build");
  if (!selectedBuild) throw new Error("No selectedBuild on Build context");
  return selectedBuild;
};
export const useSelectedStoryState = () => useRequiredContext(StoryContext, "Story");

export const BuildProvider = ({
  children,
  watchState,
}: {
  children: React.ReactNode;
  watchState?: Partial<BuildInfo>;
}) => {
  const hasTests = !!watchState?.selectedBuild && "testsForStory" in watchState.selectedBuild;
  const testsForStory =
    watchState?.selectedBuild &&
    "testsForStory" in watchState.selectedBuild &&
    watchState.selectedBuild.testsForStory?.nodes;
  const tests = [...getFragment(FragmentStoryTestFields, testsForStory || [])];
  const summary = summarizeTests(tests);

  const { toggleDiff } = useControlsDispatch();
  useEffect(() => toggleDiff(summary.changeCount > 0), [toggleDiff, summary.changeCount]);

  return (
    <BuildContext.Provider
      // eslint-disable-next-line react-hooks/exhaustive-deps
      value={useMemo(() => watchState, [JSON.stringify(watchState?.selectedBuild)])}
    >
      <StoryContext.Provider value={{ hasTests, tests, summary, ...useTests(tests) }}>
        {children}
      </StoryContext.Provider>
    </BuildContext.Provider>
  );
};

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { tests, summary, ...rest } = useRequiredContext(StoryContext, "Story");
  return (
    <StoryContext.Provider value={{ tests, summary, ...rest }}>{children}</StoryContext.Provider>
  );
};
