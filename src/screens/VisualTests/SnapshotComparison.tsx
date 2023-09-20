import { Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";

import { SnapshotImage } from "../../components/SnapshotImage";
import {
  ReviewTestBatch,
  SelectedBuildFieldsFragment,
  StoryTestFieldsFragment,
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
  borderBottom: `1px solid ${theme.appBorderColor}`,
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
  hidden: boolean;
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
}: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);
  const [focusVisible] = useState(false);
  const testControls = useTests(tests);

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
