import { Icons, Link } from "@storybook/components";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React from "react";

import { Button } from "../../components/Button";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Col, Row, Text } from "../../components/layout";
import { StoryTestFieldsFragment, TestStatus } from "../../gql/graphql";
import { summarizeTests } from "../../utils/summarizeTests";

interface StoryInfoSectionProps {
  /** A new build has been started but not yet announced. The current build is now out of date */
  isStarting: boolean;
  /** Once the test has reached the started status, this is the tests of this story */
  tests?: StoryTestFieldsFragment[];
  /** Once the test has reached the started status, this is start time of the build */
  startedAt?: Date;
  /** Start a new build */
  startDevBuild: () => void;
  /** Did the build fail entirely? */
  isBuildFailed: boolean;
  /** is the story we are looking at already replaced by a completed capture on the next build? */
  shouldSwitchToNextBuild: boolean;
  /** Select the next build if it isn't this build */
  switchToNextBuild?: () => void;
}

export const StoryInfo = ({
  isStarting,
  tests,
  startedAt,
  startDevBuild,
  isBuildFailed,
  shouldSwitchToNextBuild,
  switchToNextBuild,
}: StoryInfoSectionProps) => {
  // isInProgress means we have tests but they are still unfinished
  const { status, isInProgress, changeCount, brokenCount, modeResults, browserResults } =
    summarizeTests(tests ?? []);

  const startedAgo =
    !isStarting && formatDistance(new Date(startedAt), new Date(), { addSuffix: true });
  // isRunning means either we have no tests or they are unfinished
  const isRunning = isStarting || isInProgress;
  // isFailed means either the whole build failed or the story did
  const isFailed = isBuildFailed || status === TestStatus.Failed;
  // isErrored means there's a problem with the story
  const isErrored = isFailed || status === TestStatus.Broken;

  const showButton = isErrored && !isRunning;
  const buttonInProgress = isRunning && !isFailed;

  let details;
  if (isFailed) {
    details = (
      <Text>
        <b>Build failed</b>
        <AlertIcon />
        <br />
        <small>
          <span>An infrastructure error occured</span>
        </small>
      </Text>
    );
  } else if (isRunning) {
    details = (
      <Text>
        <b>Running tests...</b>
        <ProgressIcon />
        <br />
        <small>
          <span>Test in progress...</span>
        </small>
      </Text>
    );
  } else if (shouldSwitchToNextBuild) {
    details = (
      <Text>
        <b>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link isButton onClick={switchToNextBuild}>
            View latest snapshot
          </Link>
        </b>
        <br />
        <span>Newer test results are available for this story</span>
      </Text>
    );
  } else {
    details = (
      <Text>
        <b>
          {changeCount
            ? `${pluralize("change", changeCount, true)}${
                status === TestStatus.Accepted ? " accepted" : ""
              }`
            : "No changes"}
          {brokenCount ? `, ${pluralize("error", brokenCount, true)}` : null}
        </b>
        <StatusIcon
          icon={
            // eslint-disable-next-line no-nested-ternary
            brokenCount ? "failed" : status === TestStatus.Pending ? "changed" : "passed"
          }
        />
        <br />
        <small>
          {modeResults.length > 0 && (
            <span>
              {pluralize("mode", modeResults.length, true)}
              {", "}
              {pluralize("browser", browserResults.length, true)}
            </span>
          )}
          {modeResults.length > 0 && " • "}
          {isInProgress && <span>Test in progress...</span>}
          {!isInProgress && <span title={new Date(startedAt).toUTCString()}>{startedAgo}</span>}
        </small>
      </Text>
    );
  }
  return (
    <>
      <Row>
        <Col>{details}</Col>
        {showButton && (
          <Col push>
            <Button small secondary onClick={startDevBuild} disabled={buttonInProgress}>
              {buttonInProgress ? (
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
