import { WithTooltip } from "@storybook/components";
import {
  BatchAcceptIcon,
  ContrastIcon,
  LocationIcon,
  LockIcon,
  PlayIcon,
  SyncIcon,
  TransferIcon,
  UndoIcon,
} from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";

import { ActionButton, ButtonGroup } from "../../components/ActionButton";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Placeholder } from "../../components/Placeholder";
import { Text } from "../../components/Text";
import { TooltipMenu } from "../../components/TooltipMenu";
import { TooltipNote } from "../../components/TooltipNote";
import { ComparisonResult, ReviewTestBatch, TestStatus } from "../../gql/graphql";
import { useSelectedStoryState } from "./BuildContext";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { useReviewTestState } from "./ReviewTestContext";
import { useRunBuildState } from "./RunBuildContext";

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
  margin: "6px 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,

  "@container (min-width: 800px)": {
    margin: 8,
  },
});

const DisabledIconWrapper = styled.div(({ theme }) => ({
  padding: 9,
  "> svg": {
    display: "block",
  },
  path: {
    fill: theme.color.mediumdark,
  },
}));

const Actions = styled.div<{ showDivider?: boolean }>(({ theme, showDivider }) => ({
  gridArea: "actions",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  margin: "0px 15px",
  gap: 6,

  "@container (min-width: 300px)": {
    alignItems: "flex-start",
    margin: "15px 15px 15px 0px",
  },
  "@container (min-width: 800px)": {
    alignItems: "center",
    borderLeft: showDivider ? `1px solid ${theme.appBorderColor}` : "none",
    margin: "8px 15px 8px 0px",
    paddingLeft: 8,
  },
}));

export const SnapshotControls = ({ isOutdated }: { isOutdated: boolean }) => {
  const { baselineImageVisible, diffVisible, focusVisible, sliderVisible } = useControlsState();
  const { toggleBaselineImage, toggleDiff, toggleFocus, toggleSlider } = useControlsDispatch();
  const { isRunning, startBuild } = useRunBuildState();

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
        <Placeholder />
      </Controls>
    );

  const isAcceptable = changeCount > 0 && selectedTest?.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest?.status === TestStatus.Accepted;
  const hasControls = selectedComparison?.result === ComparisonResult.Changed;

  return (
    <>
      {hasControls && !sliderVisible && (
        <Label>
          <Text>
            <b>
              {baselineImageVisible ? "Baseline" : "Latest"}
              <span> snapshot</span>
            </b>
          </Text>
        </Label>
      )}

      {hasControls && (
        <Controls>
          {!sliderVisible && (
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
                id="button-toggle-snapshot"
                aria-label={
                  baselineImageVisible ? "Show latest snapshot" : "Show baseline snapshot"
                }
                onClick={() => toggleBaselineImage()}
              >
                <TransferIcon />
              </IconButton>
            </WithTooltip>
          )}
          <WithTooltip
            tooltip={<TooltipNote note={sliderVisible ? "Hide slider" : "Show slider"} />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-toggle-slider"
              active={sliderVisible}
              aria-label={sliderVisible ? "Hide slider" : "Show slider"}
              onClick={() => toggleSlider(!sliderVisible)}
            >
              {/* TODO Add this to @storybook/icons and import from there */}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
                <g clipPath="url(#a)">
                  <path stroke="currentColor" strokeLinecap="round" d="M7.5.5v13" />
                  <path
                    fill="currentColor"
                    d="M6 2H.5a.5.5 0 0 0-.5.5v9c0 .28.22.5.5.5H6v-1H1V3h5V2Zm1 9h6V3H7V2h6.5c.28 0 .5.23.5.5v9a.5.5 0 0 1-.5.5H7v-1Z"
                  />
                </g>
                <defs>
                  <clipPath id="a">
                    <path d="M0 0h14v14H0z" />
                  </clipPath>
                </defs>
              </svg>
            </IconButton>
          </WithTooltip>
          <WithTooltip
            tooltip={<TooltipNote note={focusVisible ? "Hide spotlight" : "Show spotlight"} />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-toggle-spotlight"
              active={focusVisible}
              aria-label={focusVisible ? "Hide spotlight" : "Show spotlight"}
              onClick={() => toggleFocus(!focusVisible)}
            >
              <LocationIcon />
            </IconButton>
          </WithTooltip>
          <WithTooltip
            tooltip={<TooltipNote note={diffVisible ? "Hide diff" : "Show diff"} />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-diff-visible"
              active={diffVisible}
              aria-label={diffVisible ? "Hide diff" : "Show diff"}
              onClick={() => toggleDiff(!diffVisible)}
            >
              <ContrastIcon />
            </IconButton>
          </WithTooltip>
        </Controls>
      )}

      {(isAcceptable || isUnacceptable) && (
        <Actions showDivider={hasControls}>
          {userCanReview && buildIsReviewable && isAcceptable && selectedTest && (
            <ButtonGroup>
              <WithTooltip
                tooltip={<TooltipNote note="Accept this story" />}
                trigger="hover"
                hasChrome={false}
              >
                <ActionButton
                  id="button-toggle-accept-story"
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
                      square
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch accept options"
                      side="right"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <BatchAcceptIcon />
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
                  id="button-toggle-accept-story"
                  disabled={isReviewing}
                  aria-label="Unaccept this story"
                  onClick={() => unacceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                  side="left"
                  status="positive"
                >
                  <UndoIcon />
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
                      square
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch unaccept options"
                      side="right"
                      status="positive"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <BatchAcceptIcon />
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
              <DisabledIconWrapper>
                <LockIcon />
              </DisabledIconWrapper>
            </WithTooltip>
          )}

          <WithTooltip
            tooltip={<TooltipNote note={isOutdated ? "Run new tests" : "Rerun tests"} />}
            trigger="hover"
            hasChrome={false}
          >
            <ActionButton
              square
              aria-label={isOutdated ? "Run new tests" : "Rerun tests"}
              onClick={startBuild}
              disabled={isRunning}
              variant="outline"
            >
              {isOutdated ? <PlayIcon /> : <SyncIcon />}
            </ActionButton>
          </WithTooltip>
        </Actions>
      )}
    </>
  );
};
