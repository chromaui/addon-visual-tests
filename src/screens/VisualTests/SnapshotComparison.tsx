import { Icons, Loader } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps, useState } from "react";

import { BrowserSelector } from "../../components/BrowserSelector";
import { IconButton } from "../../components/IconButton";
import { Bar, Col } from "../../components/layout";
import { Placeholder } from "../../components/Placeholder";
import { SnapshotImage } from "../../components/SnapshotImage";
import { ViewportSelector } from "../../components/ViewportSelector";
import { ComparisonResult, TestFieldsFragment } from "../../gql/graphql";

const Divider = styled.div(({ theme }) => ({
  backgroundColor: theme.appBorderColor,
  height: 1,
  width: "100%",
}));

interface SnapshotSectionProps {
  test?: TestFieldsFragment;
  changeCount: number;
  isInProgress: boolean;
  browserResults: ComponentProps<typeof BrowserSelector>["browserResults"];
  viewportResults: ComponentProps<typeof ViewportSelector>["viewportResults"];
}

export const SnapshotComparison = ({
  test,
  changeCount,
  isInProgress,
  browserResults,
  viewportResults,
}: SnapshotSectionProps) => {
  const [diffVisible, setDiffVisible] = useState(true);

  const comparison = test?.comparisons[0];

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
                <IconButton secondary>Accept</IconButton>
              </Col>
              <Col>
                <IconButton secondary>
                  <Icons icon="batchaccept" />
                </IconButton>
              </Col>
            </>
          )}
        </Bar>
      )}

      <Divider />

      {isInProgress && <Loader />}
      {!isInProgress && comparison && (
        <SnapshotImage>
          {comparison.headCapture?.captureImage && (
            <img src={comparison.headCapture.captureImage?.imageUrl} alt="" />
          )}
          {diffVisible &&
            comparison.result === ComparisonResult.Changed &&
            comparison.captureDiff?.diffImage && (
              <img src={comparison.captureDiff.diffImage?.imageUrl} alt="" />
            )}
          {comparison.result === ComparisonResult.CaptureError && (
            <div>
              <Icons icon="photo" />
              <p>
                A snapshot couldn’t be captured. This often occurs when a story has a code error.
                Confirm that this story successfully renders in your local Storybook and run the
                build again.
              </p>
            </div>
          )}
        </SnapshotImage>
      )}
    </>
  );
};
