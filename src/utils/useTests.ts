import { useGlobals, useGlobalTypes } from "@storybook/manager-api";
import { useCallback, useState } from "react";

import { BrowserInfo, StoryTestFieldsFragment, TestMode, TestStatus } from "../gql/graphql";
import { useSharedState } from "./useSharedState";

type BrowserData = Pick<BrowserInfo, "id" | "key" | "name">;
type ModeData = Pick<TestMode, "name">;

const useGlobalValue = (key: string) => {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return [useGlobals()[0][key], useGlobalTypes()[key]];
  } catch (e) {
    return [null, null];
  }
};

/**
 * Pick a single test+comparison (by viewport+browser) from a set of tests
 * for the same story.
 */
export function useTests(tests: StoryTestFieldsFragment[]) {
  const [theme, themeType] = useGlobalValue("theme");
  const [selectedBrowserId, onSelectBrowserId] = useState<BrowserData["id"]>(() => {
    const test = tests.find(({ status }) => status !== TestStatus.Passed) || tests[0];
    return test?.comparisons[0]?.browser.id;
  });

  const [userSelectedModeName, setUserSelectedModeName] = useSharedState<string>("");

  const [selectedModeName, onSelectModeName] = useState<ModeData["name"]>(() => {
    const changed = tests.filter(({ status }) => status !== TestStatus.Passed);
    const candidates = changed.length ? changed : tests;
    // const test = candidates.find(({ mode }) => mode.globals.theme === theme) || candidates[0];
    const test = candidates.find(({ mode }) => mode.name === userSelectedModeName) || candidates[0];
    return test?.mode.name;
  });

  const onSelectBrowser = useCallback(({ id }: BrowserData) => onSelectBrowserId(id), []);
  const onSelectMode = useCallback(
    ({ name }: ModeData) => {
      setUserSelectedModeName(name);
      onSelectModeName(name);
    },
    [setUserSelectedModeName]
  );

  const selectedTest = tests.find(({ mode }) => mode.name === selectedModeName) || tests[0];
  const selectedComparison =
    selectedTest?.comparisons.find(({ browser }) => browser.id === selectedBrowserId) ||
    selectedTest?.comparisons[0];

  return {
    modeOrder: themeType?.toolbar?.items?.map((item: { title: string }) => item.title),
    selectedTest,
    selectedComparison,
    onSelectBrowser,
    onSelectMode,
  };
}
