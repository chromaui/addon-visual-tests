import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Text } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ComparisonResult, ReviewTestBatch, TestStatus } from "../../gql/graphql";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { useReviewTestState } from "./ReviewTestContext";
import { useSelectedBuildState, useSelectedStoryState } from "./SelectedBuildContext";

const Controls = styled.div({
  gridArea: "controls",
  display: "flex",
  alignItems: "center",
  margin: "8px 10px",

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
  gap: 6,

  "@container (min-width: 800px)": {
    borderLeft: `1px solid ${theme.appBorderColor}`,
    paddingLeft: 8,
    marginLeft: 0,
  },
}));

export const SnapshotControls = () => {
  const { diffVisible, baselineImageVisible } = useControlsState();
  const { toggleDiff, toggleBaselineImage } = useControlsDispatch();

  const selectedBuild = useSelectedBuildState();
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
      <Controls>
        {hasBaselineSnapshot && (
          <WithTooltip
            tooltip={<TooltipNote note="Switch snapshot" />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton data-testid="button-toggle-snapshot" onClick={() => toggleBaselineImage()}>
              <Icons icon="transfer" />
            </IconButton>
          </WithTooltip>
        )}
        {baselineImageVisible ? (
          <Text style={{ marginLeft: 5, width: "100%" }}>
            <b>Baseline</b> Build {selectedBuild.number} on {selectedBuild.branch}
          </Text>
        ) : (
          <Text style={{ marginLeft: 5, width: "100%" }}>
            <b>Latest</b> Build {selectedBuild.number} on {selectedBuild.branch}
          </Text>
        )}

        {selectedComparison?.result === ComparisonResult.Changed && (
          <WithTooltip
            tooltip={<TooltipNote note="Toggle diff" />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              data-testid="button-diff-visible"
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
