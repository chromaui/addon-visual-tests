import { Icons } from "@storybook/components";
import { formatDistance } from "date-fns";
import pluralize from "pluralize";
import React from "react";

import { Button } from "../../components/Button";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { Col, Row, Text } from "../../components/layout";
import { BuildFieldsFragment, BuildStatus } from "../../gql/graphql";

interface BuildInfoSectionProps {
  build:
    | Pick<BuildFieldsFragment, "status" | "browsers">
    | Pick<
        Extract<BuildFieldsFragment, { startedAt: any }>,
        "status" | "browsers" | "startedAt" | "brokenCount" | "changeCount"
      >;
  viewportCount: number;
  isOutdated: boolean;
  runDevBuild: () => void;
}

export const BuildInfo = ({
  build,
  viewportCount,
  isOutdated,
  runDevBuild,
}: BuildInfoSectionProps) => {
  const { status, browsers } = build;
  const startedAgo =
    "startedAt" in build &&
    formatDistance(new Date(build.startedAt), new Date(), { addSuffix: true });
  const browserCount = browsers.length;
  const inProgress = [
    BuildStatus.InProgress,
    BuildStatus.Announced,
    BuildStatus.Prepared,
    BuildStatus.Published,
  ].includes(status);

  let statusText;
  if (inProgress) {
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
    if (!("startedAt" in build)) throw new Error(`No startedAt field on started build`);

    statusText = isOutdated ? (
      <>
        <b>Snapshots outdated</b>
        <AlertIcon />
      </>
    ) : (
      <>
        <b>
          {build.changeCount ? pluralize("change", build.changeCount, true) : "No changes"}
          {build.brokenCount ? `, ${pluralize("error", build.brokenCount, true)}` : null}
        </b>
        <StatusIcon
          icon={
            // eslint-disable-next-line no-nested-ternary
            build.brokenCount ? "failed" : status === BuildStatus.Pending ? "changed" : "passed"
          }
        />
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
        {inProgress && <span>Test in progress...</span>}
        {!inProgress && "startedAt" in build && (
          <span title={new Date(build.startedAt).toUTCString()}>{startedAgo}</span>
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
            <Button small secondary onClick={runDevBuild} disabled={inProgress}>
              {inProgress ? (
                <ProgressIcon parentComponent="Button" style={{ marginRight: 6 }} />
              ) : (
                <Icons icon="play" />
              )}
              Run tests
            </Button>
          </Col>
        )}
        {/* This code needs to be adjusted to make sense while the next build is running */}
        {[BuildStatus.Failed, BuildStatus.Broken].includes(status) && (
          <Col push>
            <Button
              small
              secondary
              onClick={runDevBuild}
              disabled={status === BuildStatus.InProgress}
            >
              <Icons icon="play" />
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
