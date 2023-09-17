import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import React from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col } from "../../components/layout";
import { ModeSelector } from "../../components/ModeSelector";
import { Placeholder } from "../../components/Placeholder";
import { TooltipMenu } from "../../components/TooltipMenu";
import {
  ComparisonResult,
  ReviewTestBatch,
  StoryTestFieldsFragment,
  TestStatus,
} from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";

type TestSummary = ReturnType<typeof summarizeTests>;
type TestControls = ReturnType<typeof useTests>;

interface SnapshotSectionProps {
  selectedTest: StoryTestFieldsFragment;
  selectedComparison: StoryTestFieldsFragment["comparisons"][0];
  status: TestSummary["status"];
  changeCount: TestSummary["changeCount"];
  isInProgress: TestSummary["isInProgress"];
  modeResults: TestSummary["modeResults"];
  browserResults: TestSummary["browserResults"];
  onSelectMode: TestControls["onSelectMode"];
  onSelectBrowser: TestControls["onSelectBrowser"];
  userCanReview: boolean;
  isReviewable: boolean;
  isReviewing: boolean;
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
  onUnaccept: (testId: StoryTestFieldsFragment["id"]) => void;
  diffVisible: boolean;
  setDiffVisible: (visible: boolean) => void;
}

export const SnapshotControls = ({
  status,
  changeCount,
  selectedTest,
  selectedComparison,
  modeResults,
  browserResults,
  onSelectMode,
  onSelectBrowser,
  userCanReview,
  isInProgress,
  isReviewable,
  isReviewing,
  onAccept,
  onUnaccept,
  diffVisible,
  setDiffVisible,
}: SnapshotSectionProps) => {
  if (isInProgress)
    return (
      <Bar>
        <Placeholder />
        {modeResults.length > 1 && <Placeholder width={50} marginLeft={-5} />}
        <Placeholder />
        <Placeholder />
      </Bar>
    );

  const isAcceptable = changeCount > 0 && selectedTest.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest.status === TestStatus.Accepted;

  return (
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
  );
};
