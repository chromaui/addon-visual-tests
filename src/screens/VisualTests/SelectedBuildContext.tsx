import React, { createContext, useContext, useEffect, useState } from "react";

import { getFragment } from "../../gql";
import { SelectedBuildFieldsFragment, StoryTestFieldsFragment } from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useRequiredContext } from "../../utils/useRequiredContext";
import { useTests } from "../../utils/useTests";
import { useControlsDispatch } from "./ControlsContext";
import { FragmentStoryTestFields } from "./graphql";

type SelectedBuild = SelectedBuildFieldsFragment | null;
type SelectedStory =
  | ({
      hasTests: boolean;
      tests: StoryTestFieldsFragment[];
      summary: ReturnType<typeof summarizeTests>;
    } & ReturnType<typeof useTests>)
  | null;

export const SelectedBuildContext = createContext<SelectedBuild>(null);
export const SelectedStoryContext = createContext<SelectedStory>(null);

export const useSelectedBuildState = () =>
  useRequiredContext(SelectedBuildContext, "SelectedBuild");
export const useSelectedStoryState = () =>
  useRequiredContext(SelectedStoryContext, "SelectedStory");

export const SelectedBuildProvider = ({
  children,
  watchState = null,
}: {
  children: React.ReactNode;
  watchState?: SelectedBuild;
}) => {
  const [state, setState] = useState<SelectedBuild>(watchState);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setState(watchState), [JSON.stringify(watchState)]);

  const hasTests = !!state && "testsForStory" in state;
  const testsForStory = hasTests && state.testsForStory?.nodes;
  const tests = [...getFragment(FragmentStoryTestFields, testsForStory || [])];
  const summary = summarizeTests(tests);
  const testData = useTests(tests);

  useControlsDispatch().toggleDiff(summary.changeCount > 0);

  return (
    <SelectedBuildContext.Provider value={state}>
      <SelectedStoryContext.Provider value={{ hasTests, tests, summary, ...testData }}>
        {children}
      </SelectedStoryContext.Provider>
    </SelectedBuildContext.Provider>
  );
};
