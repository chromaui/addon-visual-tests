import { Icons, Loader, TooltipNote, WithTooltip } from "@storybook/components";
import { Link } from "@storybook/design-system";
import { styled } from "@storybook/theming";
import React, { useState } from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col, Text } from "../../components/layout";
import { ModeSelector } from "../../components/ModeSelector";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import {
  ComparisonResult,
  ReviewTestBatch,
  StoryTestFieldsFragment,
  TestResult,
  TestStatus,
} from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";

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

  const { selectedTest, selectedComparison, onSelectBrowser, onSelectMode } = useTests(tests);
  const { status, isInProgress, changeCount, browserResults, modeResults } = summarizeTests(tests);

  // isNewStory is when the story itself is added and all tests should also be added
  const isNewStory = tests.every((test) => test.result === TestResult.Added);

  // This checks if the specific comparison is new, but the story itself is not. This indicates it was probably a new mode being added.
  const isNewTestOnExistingStory =
    selectedComparison.result === ComparisonResult.Added && !isNewStory;

  const captureErrorData =
    selectedComparison?.headCapture?.captureError &&
    "error" in selectedComparison?.headCapture?.captureError &&
    selectedComparison?.headCapture?.captureError?.error;

  const isAcceptable = changeCount > 0 && selectedTest.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest.status === TestStatus.Accepted;
  return (
    <>
      {isInProgress ? (
        <Bar>
          <Placeholder />
          <Placeholder />
          <Placeholder width={50} marginLeft={-5} />
          <Placeholder />
        </Bar>
      ) : (
        <Bar>
          {modeResults.length > 0 && (
            <Col>
              <ModeSelector
                isAccepted={status === TestStatus.Accepted}
                selectedMode={selectedTest.parameters.viewport}
                modeResults={modeResults}
                onSelectMode={onSelectMode}
              />
            </Col>
          )}
          {browserResults.length > 0 && (
            <Col>
              <BrowserSelector
                isAccepted={status === TestStatus.Accepted}
                selectedBrowser={selectedComparison.browser}
                browserResults={browserResults}
                onSelectBrowser={onSelectBrowser}
              />
            </Col>
          )}
          {selectedComparison?.result === ComparisonResult.Changed && (
            <Col>
              <WithTooltip
                tooltip={<TooltipNote note="Toggle diff" />}
                trigger="hover"
                hasChrome={false}
              >
                <IconButton
                  data-testid="button-diff-visible"
                  active={diffVisible}
                  onClick={() => setDiffVisible(!diffVisible)}
                >
                  <Icons icon="contrast" />
                </IconButton>
              </WithTooltip>
            </Col>
          )}

          {(isAcceptable || isUnacceptable) && (!isReviewable || !userCanReview) && (
            <Col push>
              <WithTooltip
                tooltip={<TooltipNote note="Reviewing disabled" />}
                trigger="hover"
                hasChrome={false}
              >
                <IconButton as="span">
                  <Icons icon="lock" />
                </IconButton>
              </WithTooltip>
            </Col>
          )}

          {userCanReview && isReviewable && isAcceptable && (
            <>
              <Col push>
                <WithTooltip
                  tooltip={<TooltipNote note="Accept this snapshot" />}
                  trigger="hover"
                  hasChrome={false}
                >
                  <IconButton
                    secondary
                    disabled={isReviewing}
                    onClick={() => onAccept(selectedTest.id)}
                  >
                    Accept
                  </IconButton>
                </WithTooltip>
              </Col>
              <Col>
                <TooltipMenu
                  placement="bottom"
                  links={[
                    {
                      id: "acceptStory",
                      title: "Accept story",
                      center: "Accept all unreviewed changes to this story",
                      onClick: () => onAccept(selectedTest.id, ReviewTestBatch.Spec),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                    {
                      id: "acceptComponent",
                      title: "Accept component",
                      center: "Accept all unreviewed changes for this component",
                      onClick: () => onAccept(selectedTest.id, ReviewTestBatch.Component),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                    {
                      id: "acceptBuild",
                      title: "Accept entire build",
                      center: "Accept all unreviewed changes for every story in the Storybook",
                      onClick: () => onAccept(selectedTest.id, ReviewTestBatch.Build),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                  ]}
                >
                  {(active) => (
                    <IconButton secondary active={active} aria-label="Batch accept">
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <Icons icon="batchaccept" />
                      )}
                    </IconButton>
                  )}
                </TooltipMenu>
              </Col>
            </>
          )}
          {userCanReview && isReviewable && isUnacceptable && (
            <>
              <Col push>
                <WithTooltip
                  tooltip={<TooltipNote note="Unaccept this snapshot" />}
                  trigger="hover"
                  hasChrome={false}
                >
                  <IconButton disabled={isReviewing} onClick={() => onUnaccept(selectedTest.id)}>
                    <Icons icon="undo" />
                    Unaccept
                  </IconButton>
                </WithTooltip>
              </Col>
            </>
          )}
        </Bar>
      )}

      <Divider />

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
