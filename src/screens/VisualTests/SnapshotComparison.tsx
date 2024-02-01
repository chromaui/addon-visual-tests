import { Loader } from "@storybook/components";
import { Link } from "../../components/design-system";
import { styled } from "@storybook/theming";
import React, { useEffect } from "react";

import { Text } from "../../components/layout";
import { SnapshotImage } from "../../components/SnapshotImage";
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
  gridTemplateRows: "auto auto 40px",
  borderBottom: `1px solid ${theme.appBorderColor}`,

  "@container (min-width: 300px)": {
    gridTemplateAreas: `
      "info actions"
      "label controls"
    `,
    gridTemplateColumns: "1fr auto",
    gridTemplateRows: "auto 40px",
  },

  "@container (min-width: 800px)": {
    gridTemplateAreas: `"info label controls actions"`,
    gridTemplateColumns: "auto 1fr auto auto",
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
}));

const FooterSection = styled.div(({ theme }) => ({
  gridArea: "footer",
  position: "sticky",
  zIndex: 1,
  bottom: 0,
  borderTop: `1px solid ${theme.appBorderColor}`,
  background: theme.background.content,
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
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
}));

const WarningText = styled(Text)(({ theme }) => ({
  color: theme.color.defaultText,
}));

interface SnapshotComparisonProps {
  isOutdated: boolean;
  isStarting: boolean;
  startDevBuild: () => void;
  isBuildFailed: boolean;
  shouldSwitchToLastBuildOnBranch: boolean;
  switchToLastBuildOnBranch?: () => void;
  setAccessToken: (accessToken: string | null) => void;
  hidden?: boolean;
  storyId: string;
}

export const SnapshotComparison = ({
  isOutdated,
  isStarting,
  startDevBuild,
  isBuildFailed,
  shouldSwitchToLastBuildOnBranch,
  switchToLastBuildOnBranch,
  setAccessToken,
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

  useEffect(() => {
    // It's possible this component doesn't unmount when the selected build, comparison, or story changes, so we need to reset state values.
    // This is most important for the baseline image toggle because baseline can not exist for a different story.
    if (
      prevStoryIdRef.current !== storyId ||
      prevSelectedComparisonIdRef.current !== selectedStory.selectedComparison?.id ||
      prevSelectedBuildIdRef.current !== selectedBuild.id
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
    return (
      <ParentGrid hidden={hidden}>
        <HeaderSection>
          <Grid>{storyInfo}</Grid>
        </HeaderSection>
        <FooterSection>
          <BuildResultsFooter setAccessToken={setAccessToken} />
        </FooterSection>
      </ParentGrid>
    );
  }

  const testSummary = summarizeTests(tests);
  const { isInProgress } = testSummary;
  const { selectedTest, selectedComparison } = selectedStory;

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
          <SnapshotControls isOutdated={isOutdated} startDevBuild={startDevBuild} />
        </Grid>
      </HeaderSection>

      <MainSection>
        {isInProgress && <Loader />}
        {!isInProgress && isNewStory && (
          <Warning>
            <WarningText>
              New story found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines" target="_blank">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && isNewMode && (
          <Warning>
            <WarningText>
              New mode found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines" target="_blank">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && isNewBrowser && (
          <Warning>
            <WarningText>
              New browser found. Accept this snapshot as a test baseline.{" "}
              <Link href="https://www.chromatic.com/docs/branching-and-baselines" target="_blank">
                Learn More »
              </Link>
            </WarningText>
          </Warning>
        )}
        {!isInProgress && selectedComparison && (
          <SnapshotImage
            key={selectedComparison.id}
            componentName={selectedTest.story?.component?.name}
            storyName={selectedTest.story?.name}
            testUrl={selectedTest.webUrl}
            comparisonResult={selectedComparison.result ?? undefined}
            latestImage={selectedComparison.headCapture?.captureImage ?? undefined}
            baselineImage={selectedComparison.baseCapture?.captureImage ?? undefined}
            baselineImageVisible={baselineImageVisible}
            diffImage={selectedComparison.captureDiff?.diffImage ?? undefined}
            focusImage={selectedComparison.captureDiff?.focusImage ?? undefined}
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
        <BuildResultsFooter setAccessToken={setAccessToken} {...testSummary} />
      </FooterSection>
    </ParentGrid>
  );
};
