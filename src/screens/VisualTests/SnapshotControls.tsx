import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { ActionButton, ButtonGroup } from "../../components/ActionButton";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Text } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ComparisonResult, ReviewTestBatch, TestStatus } from "../../gql/graphql";
import { useSelectedStoryState } from "./BuildContext";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { useReviewTestState } from "./ReviewTestContext";

const Label = styled.div(({ theme }) => ({
  gridArea: "label",
  margin: "8px 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 6,

  span: {
    display: "none",
    "@container (min-width: 300px)": {
      display: "initial",
    },
  },

  "@container (min-width: 800px)": {
    borderLeft: `1px solid ${theme.appBorderColor}`,
    paddingLeft: 10,
    marginLeft: 0,
  },
}));

const Controls = styled.div({
  gridArea: "controls",
  margin: "8px 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,

  "@container (min-width: 800px)": {
    margin: 8,
  },
});

const Actions = styled.div(({ theme }) => ({
  gridArea: "actions",
  marginRight: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,

  "@container (min-width: 300px)": {
    margin: "8px 15px",
  },
  "@container (min-width: 800px)": {
    borderLeft: `1px solid ${theme.appBorderColor}`,
    paddingLeft: 8,
    marginLeft: 0,
  },
}));

export const SnapshotControls = ({ startDevBuild }: { startDevBuild: () => void }) => {
  const { baselineImageVisible, diffVisible, focusVisible } = useControlsState();
  const { toggleBaselineImage, toggleDiff, toggleFocus } = useControlsDispatch();

  const { selectedTest, selectedComparison, summary } = useSelectedStoryState();
  const { changeCount, isInProgress } = summary;

  const { isReviewing, buildIsReviewable, userCanReview, acceptTest, unacceptTest } =
    useReviewTestState();

  if (isInProgress)
    return (
      <Controls>
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </Controls>
    );

  const isAcceptable = changeCount > 0 && selectedTest.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest.status === TestStatus.Accepted;
  const hasBaselineSnapshot = !!selectedComparison?.baseCapture?.captureImage;

  return (
    <>
      <Label>
        <Text>
          <b>
            {baselineImageVisible ? "Baseline" : "Latest"}
            <span> snapshot</span>
          </b>
        </Text>
      </Label>

      <Controls>
        {hasBaselineSnapshot && (
          <WithTooltip
            tooltip={
              <TooltipNote
                note={baselineImageVisible ? "Show latest snapshot" : "Show baseline snapshot"}
              />
            }
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              aria-label={baselineImageVisible ? "Show latest snapshot" : "Show baseline snapshot"}
              onClick={() => toggleBaselineImage()}
            >
              <Icons icon="transfer" />
              Switch
            </IconButton>
          </WithTooltip>
        )}

        {selectedComparison?.result === ComparisonResult.Changed && (
          <>
            <WithTooltip
              tooltip={<TooltipNote note={focusVisible ? "Hide spotlight" : "Show spotlight"} />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton
                active={focusVisible}
                aria-label={focusVisible ? "Hide spotlight" : "Show spotlight"}
                onClick={() => toggleFocus(!focusVisible)}
              >
                <Icons icon="location" />
              </IconButton>
            </WithTooltip>
            <WithTooltip
              tooltip={<TooltipNote note={diffVisible ? "Hide diff" : "Show diff"} />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton
                active={diffVisible}
                aria-label={diffVisible ? "Hide diff" : "Show diff"}
                onClick={() => toggleDiff(!diffVisible)}
              >
                <Icons icon="contrast" />
              </IconButton>
            </WithTooltip>
          </>
        )}
      </Controls>

      {(isAcceptable || isUnacceptable) && (
        <Actions>
          {userCanReview && buildIsReviewable && isAcceptable && (
            <ButtonGroup>
              <WithTooltip
                tooltip={<TooltipNote note="Accept this story" />}
                trigger="hover"
                hasChrome={false}
              >
                <ActionButton
                  disabled={isReviewing}
                  aria-label="Accept this story"
                  onClick={() => acceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                  side="left"
                >
                  Accept
                </ActionButton>
              </WithTooltip>
              <WithTooltip
                tooltip={<TooltipNote note="Batch accept options" />}
                trigger="hover"
                hasChrome={false}
              >
                <TooltipMenu
                  placement="bottom"
                  links={[
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
                    <ActionButton
                      containsIcon
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch accept options"
                      side="right"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <Icons icon="batchaccept" />
                      )}
                    </ActionButton>
                  )}
                </TooltipMenu>
              </WithTooltip>
            </ButtonGroup>
          )}

          {userCanReview && buildIsReviewable && isUnacceptable && (
            <ButtonGroup>
              <WithTooltip
                tooltip={<TooltipNote note="Unaccept this story" />}
                trigger="hover"
                hasChrome={false}
              >
                <ActionButton
                  disabled={isReviewing}
                  aria-label="Unaccept this story"
                  onClick={() => unacceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                  side="left"
                  status="positive"
                >
                  <Icons icon="undo" />
                  Unaccept
                </ActionButton>
              </WithTooltip>
              <WithTooltip
                tooltip={<TooltipNote note="Batch unaccept options" />}
                trigger="hover"
                hasChrome={false}
              >
                <TooltipMenu
                  placement="bottom"
                  links={[
                    {
                      id: "unacceptComponent",
                      title: "Unaccept component",
                      center: "Unaccept all unreviewed changes for this component",
                      onClick: () => unacceptTest(selectedTest.id, ReviewTestBatch.Component),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                    {
                      id: "unacceptBuild",
                      title: "Unaccept entire build",
                      center: "Unaccept all unreviewed changes for every story in the Storybook",
                      onClick: () => unacceptTest(selectedTest.id, ReviewTestBatch.Build),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                  ]}
                >
                  {(active) => (
                    <ActionButton
                      containsIcon
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch unaccept options"
                      side="right"
                      status="positive"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <Icons icon="batchaccept" />
                      )}
                    </ActionButton>
                  )}
                </TooltipMenu>
              </WithTooltip>
            </ButtonGroup>
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

          <WithTooltip
            tooltip={<TooltipNote note="Run new build" />}
            trigger="hover"
            hasChrome={false}
          >
            <ActionButton
              containsIcon
              secondary
              aria-label="Run new build"
              onClick={() => startDevBuild()}
            >
              <Icons icon="play" />
            </ActionButton>
          </WithTooltip>
        </Actions>
      )}
    </>
  );
};
