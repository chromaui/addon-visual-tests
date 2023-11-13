import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React from "react";

import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Text } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SplitButton } from "../../components/SplitButton";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ComparisonResult, ReviewTestBatch, TestStatus } from "../../gql/graphql";
import { useSelectedBuildState, useSelectedStoryState } from "./BuildContext";
import { useControlsDispatch, useControlsState } from "./ControlsContext";
import { useReviewTestState } from "./ReviewTestContext";

const Label = styled.div({
  gridArea: "label",
  margin: "8px 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 6,

  "@container (min-width: 800px)": {
    margin: 8,
  },
});

const Controls = styled.div({
  gridArea: "controls",
  marginRight: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,

  "@container (min-width: 300px)": {
    margin: "8px 15px",
  },
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
      <Label>
        {baselineImageVisible ? (
          <Text style={{ width: "100%" }}>
            <b>Baseline</b>
            {/* on {selectedBuild.branch} */}
          </Text>
        ) : (
          <Text style={{ width: "100%" }}>
            <b>Latest</b> on {selectedBuild.branch}
          </Text>
        )}
      </Label>

      <Controls>
        {hasBaselineSnapshot && (
          <WithTooltip
            tooltip={<TooltipNote note="Toggle baseline" />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              active={baselineImageVisible}
              aria-label={baselineImageVisible ? "Show latest snapshot" : "Show baseline snapshot"}
              onClick={() => toggleBaselineImage()}
            >
              <Icons icon="transfer" />
            </IconButton>
          </WithTooltip>
        )}

        {selectedComparison?.result === ComparisonResult.Changed && (
          <WithTooltip
            tooltip={<TooltipNote note="Toggle diff" />}
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
        )}
      </Controls>

      {(isAcceptable || isUnacceptable) && (
        <Actions>
          {userCanReview && buildIsReviewable && isAcceptable && (
            <div>
              <WithTooltip
                tooltip={<TooltipNote note="Accept this snapshot" />}
                trigger="hover"
                hasChrome={false}
              >
                <SplitButton
                  disabled={isReviewing}
                  aria-label="Accept test"
                  onClick={() => acceptTest(selectedTest.id)}
                  side="left"
                >
                  Accept
                </SplitButton>
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
                  <SplitButton active={active} aria-label="Batch accept" side="right">
                    {isReviewing ? (
                      <ProgressIcon parentComponent="IconButton" />
                    ) : (
                      <Icons icon="batchaccept" />
                    )}
                  </SplitButton>
                )}
              </TooltipMenu>
            </div>
          )}

          {userCanReview && buildIsReviewable && isUnacceptable && (
            <WithTooltip
              tooltip={<TooltipNote note="Unaccept this snapshot" />}
              trigger="hover"
              hasChrome={false}
            >
              <IconButton
                disabled={isReviewing}
                aria-label="Unaccept test"
                onClick={() => unacceptTest(selectedTest.id)}
              >
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
