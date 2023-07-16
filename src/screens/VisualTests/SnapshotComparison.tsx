import { Icons, Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps, useState } from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { Bar, Col } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { TooltipMenu } from "../../components/TooltipMenu";
import { ViewportSelector } from "../../components/ViewportSelector";
import { ComparisonResult, ReviewTestBatch, TestFieldsFragment } from "../../gql/graphql";

const Divider = styled.div(({ theme }) => ({
  backgroundColor: theme.appBorderColor,
  height: 1,
  width: "100%",
}));

interface SnapshotSectionProps {
  test?: TestFieldsFragment;
  changeCount: number;
  isAccepting: boolean;
  isInProgress: boolean;
  browserResults: ComponentProps<typeof BrowserSelector>["browserResults"];
  viewportResults: ComponentProps<typeof ViewportSelector>["viewportResults"];
  onAccept: (testId: TestFieldsFragment["id"], batch?: ReviewTestBatch) => void;
}

export const SnapshotComparison = ({
  test,
  changeCount,
  isAccepting,
  isInProgress,
  browserResults,
  viewportResults,
  onAccept,
}: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);

  const comparison =
    test?.comparisons.find(({ result }) => result === ComparisonResult.Changed) ||
    test?.comparisons[0];

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
          {comparison?.result === ComparisonResult.Changed && (
            <Col>
              <IconButton active={diffVisible} onClick={() => setDiffVisible(!diffVisible)}>
                <Icons icon="contrast" />
              </IconButton>
            </Col>
          )}
          {viewportResults.length > 0 && (
            <Col>
              <ViewportSelector
                viewportResults={viewportResults}
                // eslint-disable-next-line no-console
                onSelectViewport={console.log}
              />
            </Col>
          )}
          {browserResults.length > 0 && (
            <Col>
              <BrowserSelector
                browserResults={browserResults}
                // eslint-disable-next-line no-console
                onSelectBrowser={console.log}
              />
            </Col>
          )}
          {changeCount > 0 && (
            <>
              <Col push>
                <IconButton secondary onClick={() => onAccept(test.id)}>
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
                      onClick: () => onAccept(test.id, ReviewTestBatch.Spec),
                      disabled: isAccepting,
                      loading: isAccepting,
                    },
                    {
                      id: "learn",
                      title: "Accept this component",
                      center: "Accept all unreviewed changes for this component",
                      onClick: () => onAccept(test.id, ReviewTestBatch.Component),
                      disabled: isAccepting,
                      loading: isAccepting,
                    },
                  ]}
                >
                  {(active) => (
                    <IconButton secondary active={active}>
                      {isAccepting ? (
                        <ProgressIcon onButton="IconButton" />
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
      {!isInProgress && comparison && (
        <SnapshotImage as="a" href={test.webUrl} target="_blank">
          {comparison.headCapture?.captureImage && (
            <img src={comparison.headCapture.captureImage?.imageUrl} alt="" />
          )}
          {diffVisible &&
            comparison.result === ComparisonResult.Changed &&
            comparison.captureDiff?.diffImage && (
              <img src={comparison.captureDiff.diffImage?.imageUrl} alt="" />
            )}
          {comparison.result === ComparisonResult.CaptureError &&
            !comparison.headCapture?.captureImage && (
              <div>
                <Icons icon="photo" />
                <p>
                  A snapshot couldn’t be captured. This often occurs when a story has a code error.
                  Confirm that this story successfully renders in your local Storybook and run the
                  build again.
                </p>
              </div>
            )}
          <Icons icon="sharealt" />
        </SnapshotImage>
      )}
    </>
  );
};
