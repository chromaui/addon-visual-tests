import { Icons, TooltipNote, WithTooltip } from "@storybook/components";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React from "react";

import { Button } from "../../components/Button";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Col, Row, Text } from "../../components/layout";
import { TestFieldsFragment, TestStatus } from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";

interface StoryInfoSectionProps {
  tests: TestFieldsFragment[];
  startedAt: Date;
  isStarting: boolean;
  startDevBuild: () => void;
  isOutdated: boolean;
}

export const StoryInfo = ({
  tests,
  startedAt,
  isStarting,
  startDevBuild,
  isOutdated,
}: StoryInfoSectionProps) => {
  const { status, isInProgress, changeCount, brokenCount, viewportResults, browserResults } =
    summarizeTests(tests);

  const startedAgo = formatDistance(new Date(startedAt), new Date(), { addSuffix: true });
  const isErrored = [TestStatus.Broken, TestStatus.Failed].includes(status);

  let statusText;
  if (isInProgress) {
    statusText = (
      <>
        <b>Running tests...</b>
        <ProgressIcon />
      </>
    );
  } else if (status === TestStatus.Failed) {
    statusText = (
      <>
        <b>Build failed</b>
        <AlertIcon />
      </>
    );
  } else {
    statusText = isOutdated ? (
      <>
        <b>Snapshots outdated</b>
        <WithTooltip
          tooltip={<TooltipNote note="Some files have changed since the last build" />}
          trigger="hover"
          hasChrome={false}
        >
          <AlertIcon />
        </WithTooltip>
      </>
    ) : (
      <>
        <b>
          {changeCount ? pluralize("change", changeCount, true) : "No changes"}
          {brokenCount ? `, ${pluralize("error", brokenCount, true)}` : null}
        </b>
        <StatusIcon
          icon={
            // eslint-disable-next-line no-nested-ternary
            brokenCount ? "failed" : status === TestStatus.Pending ? "changed" : "passed"
          }
        />
      </>
    );
  }

  let subText;
  if (status === TestStatus.Failed) {
    subText = (
      <small>
        <span>An infrastructure error occured</span>
      </small>
    );
  } else {
    subText = isOutdated ? (
      <small>
        <span>Run tests to see what changed</span>
      </small>
    ) : (
      <small>
        {viewportResults.length > 0 && (
          <span>
            {pluralize("viewport", viewportResults.length, true)}
            {", "}
            {pluralize("browser", browserResults.length, true)}
          </span>
        )}
        {viewportResults.length > 0 && " • "}
        {isInProgress && <span>Test in progress...</span>}
        {!isInProgress && <span title={new Date(startedAt).toUTCString()}>{startedAgo}</span>}
      </small>
    );
  }

  return (
    <>
      <Row>
        <Col>
          <Text>
            {statusText}
            <br />
            {subText}
          </Text>
        </Col>
        {(isOutdated || isErrored) && (
          <Col push>
            <Button small secondary onClick={startDevBuild} disabled={isStarting}>
              {isStarting ? (
                <ProgressIcon parentComponent="Button" style={{ marginRight: 6 }} />
              ) : (
                <Icons icon="play" />
              )}
              {isErrored ? "Rerun" : "Run"} tests
            </Button>
          </Col>
        )}
        {/* Disabled for now until we implement the test screen */}
        {/* {!isOutdated && changeCount > 0 && (
          <Col push>
            <Button small secondary={isPending} tertiary={!isPending}>
              {isPending ? "Verify changes" : "View changes"}
            </Button>
          </Col>
        )} */}
      </Row>
    </>
  );
};
