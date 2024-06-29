import { Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { useEffect } from "react";

import { Link } from "../../components/design-system";
import { SnapshotImage } from "../../components/SnapshotImage";
import { Text } from "../../components/Text";
import { ZoomContainer } from "../../components/ZoomContainer";
import { ComparisonResult, TestResult, TestStatus } from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useSelectedBuildState, useSelectedStoryState } from "./BuildContext";
import { BuildResultsFooter } from "./BuildResultsFooter";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { SnapshotControls } from "./SnapshotControls";
import { StoryInfo } from "./StoryInfo";

export const Grid = styled.div(({ theme }) => ({
  display: "grid",
  gridTemplateAreas: `
    "info info"
    "actions actions"
    "label controls"
  `,
  gridTemplateColumns: "1fr fit-content(50%)",
  gridTemplateRows: "auto auto auto",
  borderBottom: `1px solid ${theme.appBorderColor}`,

  "@container (min-width: 300px)": {
    gridTemplateAreas: `
      "info actions"
      "label controls"
    `,
    gridTemplateColumns: "1fr auto",
    gridTemplateRows: "auto auto",
  },

  "@container (min-width: 800px)": {
    gridTemplateAreas: `"info label controls actions"`,
    gridTemplateColumns: "auto 1fr auto auto",
    gridTemplateRows: 40,
  },
}));

const ParentGrid = styled.div(({ theme }) => ({
  display: "grid",
  gridTemplateAreas: `
    "header"
    "main"
    "footer"
  `,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr auto",
  height: "100%",

  "&[hidden]": {
    display: "none",
  },
}));

const HeaderSection = styled.div(({ theme }) => ({
  gridArea: "header",
  position: "sticky",
  zIndex: 1,
  top: 0,
  background: theme.background.content,

  "@container (min-width: 800px)": {
    background: theme.background.app,
  },
}));

const MainSection = styled.div(({ theme }) => ({
  gridArea: "main",
  overflowY: "auto",
  maxHeight: "100%",
  background: theme.background.content,
}));

const FooterSection = styled.div(({ theme }) => ({
  gridArea: "footer",
  position: "sticky",
  zIndex: 1,
  bottom: 0,
}));

const Divider = styled.div(({ children, theme }) => ({
  display: "flex",
  alignItems: "center",
  border: `0px solid ${theme.appBorderColor}`,
  borderTopWidth: 1,
  borderBottomWidth: children ? 1 : 0,
  height: children ? 40 : 0,
  padding: children ? "0 15px" : 0,
}));

const StackTrace = styled.div(({ theme }) => ({
  fontFamily: theme.typography.fonts.mono,
  fontSize: theme.typography.size.s1,
  color: theme.color.defaultText,
  lineHeight: "18px",
  padding: 15,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
}));

const Warning = styled.div(({ theme }) => ({
  background: theme.background.hoverable,
  padding: "10px 15px",
  lineHeight: "18px",
  position: "relative",
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));

interface SnapshotComparisonProps {
  isOutdated: boolean;
  isStarting: boolean;
  isBuildFailed: boolean;
  shouldSwitchToLastBuildOnBranch: boolean;
  switchToLastBuildOnBranch?: () => void;
  hidden?: boolean;
  storyId: string;
}

export const SnapshotComparison = ({
  isOutdated,
  isStarting,
  isBuildFailed,
  shouldSwitchToLastBuildOnBranch,
  switchToLastBuildOnBranch,
  hidden,
  storyId,
}: SnapshotComparisonProps) => {
  const { baselineImageVisible, diffVisible, focusVisible } = useControlsState();
  const { toggleBaselineImage, toggleSettings, toggleWarnings } = useControlsDispatch();

  const selectedBuild = useSelectedBuildState();
  const startedAt: Date = "startedAt" in selectedBuild && selectedBuild.startedAt;

  const selectedStory = useSelectedStoryState();
  const { tests } = selectedStory;

  const prevStoryIdRef = React.useRef(storyId);
  const prevSelectedComparisonIdRef = React.useRef(selectedStory.selectedComparison?.id);
  const prevSelectedBuildIdRef = React.useRef(selectedBuild.id);

  const { selectedTest, selectedComparison } = selectedStory;

  // isNewStory is when the story itself is added and all tests should also be added
  const isNewStory = tests.every(
    ({ result, status }) => result === TestResult.Added && status !== TestStatus.Accepted
  );

  // This checks if the specific comparison is new, but the story itself is not. This indicates it was probably a new mode being added.
  const isNewMode =
    !isNewStory &&
    selectedTest?.result === TestResult.Added &&
    selectedTest?.status !== TestStatus.Accepted;

  // If any of the tests has a new comparison, and the test isn't new it is a new browser.
  const isNewBrowser =
    !isNewStory &&
    selectedComparison?.result === ComparisonResult.Added &&
    selectedTest?.result !== TestResult.Added &&
    selectedTest?.status !== TestStatus.Accepted;

  useEffect(() => {
    // It's possible this component doesn't unmount when the selected build, comparison, or story changes, so we need to reset state values.
    // This is most important for the baseline image toggle because baseline can not exist for a different story.
    if (
      prevStoryIdRef.current !== storyId ||
      prevSelectedComparisonIdRef.current !== selectedStory.selectedComparison?.id ||
      prevSelectedBuildIdRef.current !== selectedBuild.id ||
      isNewStory ||
      isNewMode ||
      isNewBrowser
    ) {
      toggleBaselineImage(false);
      toggleSettings(false);
      toggleWarnings(false);
    }

    prevSelectedComparisonIdRef.current = selectedStory.selectedComparison?.id;
    prevStoryIdRef.current = storyId;
    prevSelectedBuildIdRef.current = selectedBuild.id;
  }, [
    selectedBuild.id,
    storyId,
    selectedStory,
    toggleBaselineImage,
    toggleSettings,
    toggleWarnings,
    isNewStory,
    isNewMode,
    isNewBrowser,
  ]);

  const storyInfo = (
    <StoryInfo
      {...{
        tests,
        startedAt,
        isStarting,
        isBuildFailed,
        isOutdated,
        shouldSwitchToLastBuildOnBranch,
        switchToLastBuildOnBranch,
      }}
    />
  );

  if (isStarting || !tests.length) {
    return (
      <ParentGrid hidden={hidden}>
        <HeaderSection>
          <Grid>{storyInfo}</Grid>
        </HeaderSection>
        <FooterSection>
          <BuildResultsFooter />
        </FooterSection>
      </ParentGrid>
    );
  }

  const testSummary = summarizeTests(tests);
  const { isInProgress } = testSummary;

  const captureErrorData =
    selectedComparison?.headCapture?.captureError &&
    "error" in selectedComparison?.headCapture?.captureError &&
    selectedComparison?.headCapture?.captureError?.error;

  return (
    <ParentGrid hidden={hidden}>
      <HeaderSection>
        <Grid>
          {storyInfo}
          <SnapshotControls isOutdated={isOutdated} />
        </Grid>
      </HeaderSection>

      <MainSection>
        {isInProgress && <Loader />}
        {!isInProgress && isNewStory && (
          <Warning>
            <Text>
              New story found. Accept this snapshot as a test baseline.{" "}
              <Link
                withArrow
                href="https://www.chromatic.com/docs/branching-and-baselines"
                target="_blank"
              >
                Learn more
              </Link>
            </Text>
          </Warning>
        )}
        {!isInProgress && isNewMode && (
          <Warning>
            <Text>
              New mode found. Accept this snapshot as a test baseline.{" "}
              <Link
                withArrow
                href="https://www.chromatic.com/docs/branching-and-baselines"
                target="_blank"
              >
                Learn more
              </Link>
            </Text>
          </Warning>
        )}
        {!isInProgress && isNewBrowser && (
          <Warning>
            <Text>
              New browser found. Accept this snapshot as a test baseline.{" "}
              <Link
                withArrow
                href="https://www.chromatic.com/docs/branching-and-baselines"
                target="_blank"
              >
                Learn more
              </Link>
            </Text>
          </Warning>
        )}
        {!isInProgress && selectedComparison && (
          <ZoomContainer
            render={(zoomProps) => (
              <SnapshotImage
                key={selectedComparison.id}
                componentName={selectedTest?.story?.component?.name}
                storyName={selectedTest?.story?.name}
                comparisonResult={selectedComparison.result ?? undefined}
                latestImage={selectedComparison.headCapture?.captureImage ?? undefined}
                baselineImage={selectedComparison.baseCapture?.captureImage ?? undefined}
                baselineImageVisible={baselineImageVisible}
                diffImage={selectedComparison.captureDiff?.diffImage ?? undefined}
                focusImage={selectedComparison.captureDiff?.focusImage ?? undefined}
                diffVisible={diffVisible}
                focusVisible={focusVisible}
                {...zoomProps}
              />
            )}
          />
        )}

        {!isInProgress && captureErrorData && (
          <>
            <Divider>
              <b>Error stack trace</b>
            </Divider>
            <StackTrace>{captureErrorData.stack || captureErrorData.message}</StackTrace>
          </>
        )}
      </MainSection>
      <FooterSection>
        <BuildResultsFooter />
      </FooterSection>
    </ParentGrid>
  );
};
