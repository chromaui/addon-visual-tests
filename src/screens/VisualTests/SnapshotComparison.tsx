import { Icons, Loader } from "@storybook/components";
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
  onAccept: (testId: StoryTestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
}

export const SnapshotComparison = ({ tests, isAccepting, onAccept }: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);

  const { selectedTest, selectedComparison, onSelectBrowser, onSelectViewport } = useTests(tests);
  const { isInProgress, changeCount, browserResults, viewportResults } = summarizeTests(tests);

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
          {selectedComparison?.result === ComparisonResult.Changed && (
            <Col>
              <IconButton active={diffVisible} onClick={() => setDiffVisible(!diffVisible)}>
                <Icons icon="contrast" />
              </IconButton>
            </Col>
          )}
          {viewportResults.length > 0 && (
            <Col>
              <ViewportSelector
                selectedViewport={selectedTest.parameters.viewport}
                viewportResults={viewportResults}
                onSelectViewport={onSelectViewport}
              />
            </Col>
          )}
          {browserResults.length > 0 && (
            <Col>
              <BrowserSelector
                selectedBrowser={selectedComparison.browser}
                browserResults={browserResults}
                onSelectBrowser={onSelectBrowser}
              />
            </Col>
          )}
          {changeCount > 0 && selectedTest.status !== TestStatus.Accepted && (
            <>
              <Col push>
                <IconButton secondary onClick={() => onAccept(selectedTest.id)}>
                  Accept
                </IconButton>
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
          as="a"
          href={selectedTest.webUrl}
          target="_blank"
          comparisonResult={selectedComparison.result}
          captureImage={selectedComparison.headCapture?.captureImage}
          diffImage={selectedComparison.captureDiff?.diffImage}
          diffVisible={diffVisible}
        />
      )}
    </>
  );
};
