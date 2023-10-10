import { Loader } from "@storybook/components";
import { Link } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";

import { Text } from "../../components/layout";
import { SnapshotImage } from "../../components/SnapshotImage";
import {
  ComparisonResult,
  ReviewTestBatch,
  SelectedBuildFieldsFragment,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";
import { BuildResultsFooter } from "./BuildResultsFooter";
import { SnapshotControls } from "./SnapshotControls";
import { StoryInfo } from "./StoryInfo";

export const Grid = styled.div(({ theme }) => ({
  display: "grid",
  gridTemplateAreas: `
    "info button"
    "controls actions"
  `,
  gridTemplateColumns: "1fr auto",
  gridTemplateRows: "auto 40px",
  borderBottom: `1px solid ${theme.appBorderColor}`,

  "@container (min-width: 800px)": {
    backgroundColor: theme.background.app,
    gridTemplateAreas: `"info controls actions button"`,
    gridTemplateColumns: "1fr auto auto auto",
    gridTemplateRows: "40px",
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
  backgroundColor: theme.background.app,
  height: "100%",

  "&[hidden]": {
    display: "none",
  },
}));

const HeaderSection = styled.div(({ theme }) => ({
  gridArea: "header",
  position: "sticky",
  zIndex: 10,
  top: 0,
  background: theme.background.app,
}));

const MainSection = styled.div(({ theme }) => ({
  gridArea: "main",
  overflowY: "auto",
  maxHeight: "100%",
}));

const FooterSection = styled.div(({ theme }) => ({
  gridArea: "footer",
  position: "sticky",
  zIndex: 10,
  bottom: 0,
  borderTop: `1px solid ${theme.appBorderColor}`,
  background: theme.background.app,
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
  background: theme.background.warning,
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
}));

const WarningText = styled(Text)(({ theme }) => ({
  color: theme.color.darkest,
}));

interface SnapshotSectionProps {
  tests?: StoryTestFieldsFragment[];
  startedAt: Date;
  isStarting: boolean;
  startDevBuild: () => void;
  isBuildFailed: boolean;
  shouldSwitchToLastBuildOnBranch: boolean;
  switchToLastBuildOnBranch?: () => void;
  userCanReview: boolean;
  isReviewable: boolean;
  isReviewing: boolean;
  baselineImageVisible: boolean;
  toggleBaselineImage: () => void;
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
  onUnaccept: (testId: StoryTestFieldsFragment["id"]) => void;
  setAccessToken: (accessToken: string | null) => void;
  selectedBuild: SelectedBuildFieldsFragment;
  setSettingsVisible: (visible: boolean) => void;
  setWarningsVisible: (visible: boolean) => void;
  settingsVisible: boolean;
  warningsVisible: boolean;
  hidden?: boolean;
  storyId: string;
}

export const SnapshotComparison = ({
  tests = [],
  startedAt,
  isStarting,
  startDevBuild,
  isBuildFailed,
  shouldSwitchToLastBuildOnBranch,
  switchToLastBuildOnBranch,
  userCanReview,
  isReviewable,
  isReviewing,
  onAccept,
  onUnaccept,
  baselineImageVisible,
  toggleBaselineImage,
  setAccessToken,
  selectedBuild,
  setSettingsVisible,
  setWarningsVisible,
  settingsVisible,
  warningsVisible,
  hidden,
  storyId,
}: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);
  const [focusVisible] = useState(false);
  const testControls = useTests(tests);

  const prevStoryIdRef = React.useRef(storyId);
  const prevSelectedComparisonIdRef = React.useRef(testControls.selectedComparison?.id);
  const prevSelectedBuildIdRef = React.useRef(selectedBuild.id);

  React.useEffect(() => {
    // It's possible this component doesn't unmount when the selected build, comparison, or story changes, so we need to reset state values.
    // This is most important for the baseline image toggle because baseline can not exist for a different story.
    if (
      prevStoryIdRef.current !== storyId ||
      prevSelectedComparisonIdRef.current !== testControls.selectedComparison?.id ||
      prevSelectedBuildIdRef.current !== selectedBuild.id
    ) {
      if (baselineImageVisible) toggleBaselineImage();
      setSettingsVisible(false);
      setWarningsVisible(false);
    }
    prevSelectedComparisonIdRef.current = testControls.selectedComparison?.id;
    prevStoryIdRef.current = storyId;
    prevSelectedBuildIdRef.current = selectedBuild.id;
  }, [
    baselineImageVisible,
    selectedBuild.id,
    setSettingsVisible,
    setWarningsVisible,
    storyId,
    testControls,
    toggleBaselineImage,
  ]);

  const storyInfo = (
    <StoryInfo
      {...{
        tests,
        startedAt,
        isStarting,
        startDevBuild,
        isBuildFailed,
        shouldSwitchToLastBuildOnBranch,
        switchToLastBuildOnBranch,
      }}
    />
  );

  if (isStarting || !tests.length) {
    return <Grid>{storyInfo}</Grid>;
  }

  const testSummary = summarizeTests(tests);
  const { isInProgress } = testSummary;
  const { selectedTest, selectedComparison } = testControls;

  // This works for the very first build, but it is possible that the first build failed, and the second build is the first successful build with all tests accepted.
  const isFirstBuild = selectedBuild?.number === 1;

  // isNewStory is when the story itself is added and all tests should also be added
  const isNewStory = tests.every(
    ({ result, status }) => result === TestResult.Added && status !== TestStatus.Accepted
  );

  // This checks if the specific comparison is new, but the story itself is not. This indicates it was probably a new mode being added.
  const isNewMode =
    !isNewStory &&
    selectedTest.result === TestResult.Added &&
    selectedTest.status !== TestStatus.Accepted;

  // If any of the tests has a new comparison, and the test isn't new it is a new browser.
  const isNewBrowser =
    !isNewStory &&
    selectedComparison.result === ComparisonResult.Added &&
    selectedTest.result !== TestResult.Added &&
    selectedTest.status !== TestStatus.Accepted;

  const captureErrorData =
    selectedComparison?.headCapture?.captureError &&
    "error" in selectedComparison?.headCapture?.captureError &&
    selectedComparison?.headCapture?.captureError?.error;

  return (
    <ParentGrid hidden={hidden}>
      <HeaderSection>
        <Grid>
          {storyInfo}

          <SnapshotControls
            {...testControls}
            {...testSummary}
            {...{ diffVisible, setDiffVisible }}
            {...{ userCanReview, isReviewable, isReviewing, onAccept, onUnaccept }}
          />
        </Grid>
      </HeaderSection>

      <MainSection>
        {isInProgress && <Loader />}
        {!isInProgress && isNewStory && !isFirstBuild && (
          <Warning>
            <WarningText>
              New story found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && isFirstBuild && (
          <Warning>
            <WarningText>
              First build on this project. Baseline created and auto-accepted.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && isNewMode && (
          <Warning>
            <WarningText>
              New mode found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && isNewBrowser && (
          <Warning>
            <WarningText>
              New browser found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && selectedComparison && (
          <SnapshotImage
            componentName={selectedTest.story?.component?.name}
            storyName={selectedTest.story?.name}
            testUrl={selectedTest.webUrl}
            comparisonResult={selectedComparison.result ?? undefined}
            captureImage={
              baselineImageVisible
                ? selectedComparison.baseCapture?.captureImage ?? undefined
                : selectedComparison.headCapture?.captureImage ?? undefined
            }
            diffImage={selectedComparison.captureDiff?.diffImage ?? undefined}
            diffVisible={diffVisible}
            focusVisible={focusVisible}
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
        <BuildResultsFooter
          hasBaselineSnapshot={!!selectedComparison?.baseCapture?.captureImage}
          setAccessToken={setAccessToken}
          baselineImageVisible={baselineImageVisible}
          selectedBuild={selectedBuild}
          toggleBaselineImage={toggleBaselineImage}
          setSettingsVisible={setSettingsVisible}
          setWarningsVisible={setWarningsVisible}
          settingsVisible={settingsVisible}
          warningsVisible={warningsVisible}
        />
      </FooterSection>
    </ParentGrid>
  );
};
