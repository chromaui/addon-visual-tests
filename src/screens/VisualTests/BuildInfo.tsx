import { Icons } from "@storybook/components";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React from "react";

import { Button } from "../../components/Button";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Col, Row, Text } from "../../components/layout";
import { BuildStatus } from "../../gql/graphql";

interface BuildInfoSectionProps {
  status: BuildStatus;
  startedAt: string;
  brokenCount: number;
  browserCount: number;
  changeCount: number;
  viewportCount: number;
  isInProgress: boolean;
  isOutdated: boolean;
  isPending: boolean;
  isRunning: boolean;
  runDevBuild: () => void;
}

export const BuildInfo = ({
  status,
  startedAt,
  brokenCount,
  browserCount,
  changeCount,
  viewportCount,
  isInProgress,
  isOutdated,
  isPending,
  isRunning,
  runDevBuild,
}: BuildInfoSectionProps) => {
  const startedAgo =
    startedAt && formatDistance(new Date(startedAt), new Date(), { addSuffix: true });

  let statusText;
  if (status === BuildStatus.InProgress) {
    statusText = (
      <>
        <b>Running tests...</b>
        <ProgressIcon />
      </>
    );
  } else if (status === BuildStatus.Failed) {
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
        <AlertIcon />
      </>
    ) : (
      <>
        <b>
          {changeCount ? pluralize("change", changeCount, true) : "No changes"}
          {brokenCount ? `, ${pluralize("error", brokenCount, true)}` : null}
        </b>
        {/* eslint-disable-next-line no-nested-ternary */}
        <StatusIcon icon={brokenCount ? "failed" : isPending ? "changed" : "passed"} />
      </>
    );
  }

  let subText;
  if (status === BuildStatus.Failed) {
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
        <span>
          {pluralize("viewport", viewportCount, true)}
          {", "}
          {pluralize("browser", browserCount, true)}
        </span>
        {" • "}
        {isInProgress && <span>Test in progress...</span>}
        {!isInProgress && startedAt && (
          <span title={new Date(startedAt).toUTCString()}>{startedAgo}</span>
        )}
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
        {isOutdated && (
          <Col push>
            <Button small secondary onClick={runDevBuild} disabled={isRunning}>
              {isRunning ? <ProgressIcon onButton /> : <Icons icon="play" />}
              Run tests
            </Button>
          </Col>
        )}
        {status === BuildStatus.Failed && (
          <Col push>
            <Button small secondary onClick={runDevBuild} disabled={isRunning}>
              {isRunning ? <ProgressIcon onButton /> : <Icons icon="play" />}
              Rerun tests
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
