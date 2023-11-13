import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
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
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { useReviewTestState } from "./ReviewTestContext";

const Controls = styled.div({
  gridArea: "controls",
  display: "flex",
  alignItems: "center",
  margin: "8px 10px",
  gap: 6,

  "@container (min-width: 800px)": {
    flexDirection: "row-reverse",
  },
});

const Actions = styled.div(({ theme }) => ({
  gridArea: "actions",
  margin: "8px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",

  "@container (min-width: 800px)": {
    borderLeft: `1px solid ${theme.appBorderColor}`,
    paddingLeft: 8,
    marginLeft: 0,
  },
}));

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
}

export const SnapshotControls = ({
  status,
  changeCount,
  selectedTest,
  selectedComparison,
  isInProgress,
  modeResults,
  browserResults,
  onSelectMode,
  onSelectBrowser,
}: SnapshotSectionProps) => {
  const { diffVisible } = useControlsState();
  const { toggleDiff } = useControlsDispatch();

  const { isReviewing, buildIsReviewable, userCanReview, acceptTest, unacceptTest } =
    useReviewTestState();

  if (isInProgress)
    return (
      <Controls>
        <Placeholder />
        {modeResults.length > 1 && <Placeholder width={50} marginLeft={-5} />}
        <Placeholder />
        <Placeholder />
      </Controls>
    );

  const isAcceptable = changeCount > 0 && selectedTest.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest.status === TestStatus.Accepted;

  return (
    <>
      <Controls>
        {modeResults.length > 0 && (
          <ModeSelector
            isAccepted={status === TestStatus.Accepted}
            selectedMode={selectedTest.mode}
            modeResults={modeResults}
            onSelectMode={onSelectMode}
          />
        )}
        {browserResults.length > 0 && (
          <BrowserSelector
            isAccepted={status === TestStatus.Accepted}
            selectedBrowser={selectedComparison.browser}
            browserResults={browserResults}
            onSelectBrowser={onSelectBrowser}
          />
        )}
        {selectedComparison?.result === ComparisonResult.Changed && (
          <WithTooltip
            tooltip={<TooltipNote note="Toggle diff" />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              data-testid="button-diff-visible"
              id="button-diff-visible"
              active={diffVisible}
              onClick={() => toggleDiff(!diffVisible)}
            >
              <Icons icon="contrast" />
            </IconButton>
          </WithTooltip>
        )}
      </Controls>

      {(isAcceptable || isUnacceptable) && (
        <Actions>
          {userCanReview && buildIsReviewable && isAcceptable && (
            <>
              <WithTooltip
                tooltip={<TooltipNote note="Accept this snapshot" />}
                trigger="hover"
                hasChrome={false}
              >
                <IconButton
                  secondary
                  disabled={isReviewing}
                  onClick={() => acceptTest(selectedTest.id)}
                >
                  Accept
                </IconButton>
              </WithTooltip>
              <TooltipMenu
                placement="bottom"
                links={[
                  {
                    id: "acceptStory",
                    title: "Accept story",
                    center: "Accept all unreviewed changes to this story",
                    onClick: () => acceptTest(selectedTest.id, ReviewTestBatch.Spec),
                    disabled: isReviewing,
                    loading: isReviewing,
                  },
                  {
                    id: "acceptComponent",
                    title: "Accept component",
                    center: "Accept all unreviewed changes for this component",
                    onClick: () => acceptTest(selectedTest.id, ReviewTestBatch.Component),
                    disabled: isReviewing,
                    loading: isReviewing,
                  },
                  {
                    id: "acceptBuild",
                    title: "Accept entire build",
                    center: "Accept all unreviewed changes for every story in the Storybook",
                    onClick: () => acceptTest(selectedTest.id, ReviewTestBatch.Build),
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
            </>
          )}

          {userCanReview && buildIsReviewable && isUnacceptable && (
            <WithTooltip
              tooltip={<TooltipNote note="Unaccept this snapshot" />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton disabled={isReviewing} onClick={() => unacceptTest(selectedTest.id)}>
                <Icons icon="undo" />
                Unaccept
              </IconButton>
            </WithTooltip>
          )}

          {!(userCanReview && buildIsReviewable) && (
            <WithTooltip
              tooltip={<TooltipNote note="Reviewing disabled" />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton as="span">
                <Icons icon="lock" />
              </IconButton>
            </WithTooltip>
          )}
        </Actions>
      )}
    </>
  );
};
