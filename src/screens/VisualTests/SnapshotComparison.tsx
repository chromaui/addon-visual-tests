import { Loader } from "@storybook/components";
import { Link } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useState } from "react";

import { Text } from "../../components/layout";
import { SnapshotImage } from "../../components/SnapshotImage";
import {
  ComparisonResult,
  ReviewTestBatch,
  StoryTestFieldsFragment,
  TestResult,
} from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";
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
  color: theme.color.warning,
  background: theme.background.warning,
  padding: "10px",
  lineHeight: "18px",
  position: "relative",
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
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
  onUnaccept: (testId: StoryTestFieldsFragment["id"]) => void;
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

  // isNewStory is when the story itself is added and all tests should also be added
  const isNewStory = tests.every((test) => test.result === TestResult.Added);

  // This checks if the specific comparison is new, but the story itself is not. This indicates it was probably a new mode being added.
  const isNewTestOnExistingStory =
    selectedComparison.result === ComparisonResult.Added && !isNewStory;

  const captureErrorData =
    selectedComparison?.headCapture?.captureError &&
    "error" in selectedComparison?.headCapture?.captureError &&
    selectedComparison?.headCapture?.captureError?.error;

  return (
    <>
      <Grid>
        {storyInfo}

        <SnapshotControls
          {...testControls}
          {...testSummary}
          {...{ diffVisible, setDiffVisible }}
          {...{ userCanReview, isReviewable, isReviewing, onAccept, onUnaccept }}
        />
      </Grid>

      {isInProgress && <Loader />}
      {!isInProgress && isNewStory && (
        <Warning>
          <Text>
            New story found. Accept this snapshot as a test baseline.{" "}
            <Link href="https://www.chromatic.com/docs/branching-and-baselines">Learn More »</Link>
          </Text>
        </Warning>
      )}
      {!isInProgress && isNewTestOnExistingStory && (
        <Warning>
          <Text>
            New mode found. Accept this mode as a test baseline.{" "}
            <Link href="https://www.chromatic.com/docs/branching-and-baselines">Learn More »</Link>
          </Text>
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
    </>
  );
};
