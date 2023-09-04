import { Icons, Loader, TooltipNote, WithTooltip } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { useState } from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ViewportSelector } from "../../components/ViewportSelector";
import {
  ComparisonResult,
  ReviewTestBatch,
  StoryTestFieldsFragment,
  TestStatus,
} from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";
import { useTests } from "../../utils/useTests";

const Divider = styled.div(({ theme }) => ({
  backgroundColor: theme.appBorderColor,
  height: 1,
  width: "100%",
}));

interface SnapshotSectionProps {
  tests: StoryTestFieldsFragment[];
  isAccepting: boolean;
  baselineImageVisible: boolean;
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
}

export const SnapshotComparison = ({
  tests,
  isAccepting,
  onAccept,
  baselineImageVisible,
}: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);
  const [focusVisible, setFocusVisible] = useState(false);

  const { selectedTest, selectedComparison, onSelectBrowser, onSelectViewport } = useTests(tests);
  const { status, isInProgress, changeCount, browserResults, viewportResults } =
    summarizeTests(tests);

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
          {viewportResults.length > 0 && (
            <Col>
              <WithTooltip
                tooltip={<TooltipNote note="Switch viewport" />}
                trigger="hover"
                hasChrome={false}
              >
                <ViewportSelector
                  isAccepted={status === TestStatus.Accepted}
                  selectedViewport={selectedTest.parameters.viewport}
                  viewportResults={viewportResults}
                  onSelectViewport={onSelectViewport}
                />
              </WithTooltip>
            </Col>
          )}
          {browserResults.length > 0 && (
            <Col>
              <WithTooltip
                tooltip={<TooltipNote note="Switch browser" />}
                trigger="hover"
                hasChrome={false}
              >
                <BrowserSelector
                  isAccepted={status === TestStatus.Accepted}
                  selectedBrowser={selectedComparison.browser}
                  browserResults={browserResults}
                  onSelectBrowser={onSelectBrowser}
                />
              </WithTooltip>
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
          {changeCount > 0 && selectedTest.status !== TestStatus.Accepted && (
            <>
              <Col push>
                <WithTooltip
                  tooltip={<TooltipNote note="Accept this snapshot" />}
                  trigger="hover"
                  hasChrome={false}
                >
                  <IconButton secondary onClick={() => onAccept(selectedTest.id)}>
                    Accept
                  </IconButton>
                </WithTooltip>
              </Col>
              <Col>
                <TooltipMenu
                  placement="bottom"
                  links={[
                    {
                      id: "logout",
                      title: "Accept all viewports",
                      center: "Accept all unreviewed changes to this story",
                      onClick: () => onAccept(selectedTest.id, ReviewTestBatch.Spec),
                      disabled: isAccepting,
                      loading: isAccepting,
                    },
                    {
                      id: "learn",
                      title: "Accept this component",
                      center: "Accept all unreviewed changes for this component",
                      onClick: () => onAccept(selectedTest.id, ReviewTestBatch.Component),
                      disabled: isAccepting,
                      loading: isAccepting,
                    },
                  ]}
                >
                  {(active) => (
                    <IconButton secondary active={active}>
                      {isAccepting ? (
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
        </Bar>
      )}

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
    </>
  );
};
