import { Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { useState } from "react";

import { SnapshotImage } from "../../components/SnapshotImage";
import { ReviewTestBatch, StoryTestFieldsFragment } from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";
import { SnapshotControls } from "./SnapshotControls";

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
  tests: StoryTestFieldsFragment[];
  userCanReview: boolean;
  isReviewable: boolean;
  isReviewing: boolean;
  baselineImageVisible: boolean;
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
  onUnaccept: (testId: StoryTestFieldsFragment["id"]) => void;
}

export const SnapshotComparison = ({
  tests,
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
  const testSummary = summarizeTests(tests);

  const { selectedTest, selectedComparison } = testControls;
  const { isInProgress } = testSummary;

  const captureErrorData =
    selectedComparison?.headCapture?.captureError &&
    "error" in selectedComparison?.headCapture?.captureError &&
    selectedComparison?.headCapture?.captureError?.error;

  return (
    <>
      <SnapshotControls
        {...testControls}
        {...testSummary}
        {...{ diffVisible, setDiffVisible }}
        {...{ userCanReview, isReviewable, isReviewing, onAccept, onUnaccept }}
      />

      <Divider />

      {isInProgress && <Loader />}
      {!isInProgress && selectedComparison && (
        <SnapshotImage
          componentName={selectedTest.story.component.name}
          storyName={selectedTest.story.name}
          testUrl={selectedTest.webUrl}
          comparisonResult={selectedComparison.result}
          captureImage={
            baselineImageVisible
              ? selectedComparison.baseCapture?.captureImage
              : selectedComparison.headCapture?.captureImage
          }
          diffImage={selectedComparison.captureDiff?.diffImage}
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
