import { Link } from "@storybook/components";
import { PlayIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import pluralize from "pluralize";
import React from "react";

import { Button } from "../../components/Button";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { ProgressIcon } from "../../components/icons/ProgressIcon";
import { StatusIcon } from "../../components/icons/StatusIcon";
import { StoryTestFieldsFragment, TestStatus } from "../../gql/graphql";
import { formatDate } from "../../utils/formatDate";
import { summarizeTests } from "../../utils/summarizeTests";
import { useRunBuildState } from "./RunBuildContext";

const Info = styled.div(({ theme }) => ({
  gridArea: "info",
  display: "flex",
  justifySelf: "start",
  justifyContent: "center",
  flexDirection: "column",
  margin: 15,
  lineHeight: "18px",
  color: theme.base === "light" ? `${theme.color.defaultText}99` : `${theme.color.light}99`,

  b: {
    color: theme.base === "light" ? `${theme.color.defaultText}` : `${theme.color.light}`,
  },
  small: {
    fontSize: theme.typography.size.s1,
  },

  "@container (min-width: 800px)": {
    margin: "6px 10px 6px 15px",
    alignItems: "center",
    flexDirection: "row",

    small: {
      fontSize: "inherit",
    },

    "[data-hidden-large]": {
      display: "none",
    },

    "& > span:first-of-type": {
      display: "inline-flex",
      alignItems: "center",
      height: 24,
      marginRight: 6,
    },
  },
}));

const Actions = styled.div({
  gridArea: "actions",
  display: "flex",
  justifySelf: "end",
  justifyContent: "center",
  alignItems: "start",
  margin: 15,

  "@container (min-width: 800px)": {
    margin: "6px 15px 6px 0",
  },
});

interface StoryInfoSectionProps {
  /** A new build has been started but not yet announced. The current build is now out of date */
  isStarting: boolean;
  /** Once the test has reached the started status, this is the tests of this story */
  tests?: StoryTestFieldsFragment[];
  /** Once the test has reached the started status, this is start time of the build */
  startedAt?: Date;
  /** Did the build fail entirely? */
  isBuildFailed: boolean;
  /** Are there any code changes since the last build? */
  isOutdated: boolean;
  /** is the story we are looking at replaced by a capture on the last build on the branch? */
  shouldSwitchToLastBuildOnBranch: boolean;
  /** Select the last build on the branch if it isn't this build */
  switchToLastBuildOnBranch?: () => void;
}

export const StoryInfo = ({
  isStarting,
  tests,
  startedAt,
  isBuildFailed,
  isOutdated,
  shouldSwitchToLastBuildOnBranch,
  switchToLastBuildOnBranch,
}: StoryInfoSectionProps) => {
  const { isRunning, startBuild } = useRunBuildState();

  // isInProgress means we have tests but they are still unfinished
  const { status, isInProgress, changeCount, brokenCount, modeResults, browserResults } =
    summarizeTests(tests ?? []);

  const startedAgo = !isStarting && startedAt && formatDate(new Date(startedAt).getTime());
  // isRunningStory means either we have no tests (yet) or they are unfinished
  const isRunningStory = isStarting || isInProgress;
  // isFailed means either the whole build failed or the story did
  const isFailed = isBuildFailed || status === TestStatus.Failed;
  // isErrored means there's a problem with the story
  const isErrored = isFailed || status === TestStatus.Broken;

  const showButton = (isErrored || isOutdated) && !isRunningStory && !changeCount;

  let details;
  if (isOutdated) {
    details = (
      <Info>
        <span>
          <b>Code edits detected</b>
        </span>
        <small>
          <span>Run tests to see what changed</span>
        </small>
      </Info>
    );
  } else if (isFailed) {
    details = (
      <Info>
        <span>
          <b>Build failed</b>
          <AlertIcon />
        </span>
        <small>
          <span>An infrastructure error occured</span>
        </small>
      </Info>
    );
  } else if (isRunningStory) {
    details = (
      <Info>
        <span>
          <b>Running tests...</b>
          <ProgressIcon />
        </span>
        <small>
          <span>Test in progress...</span>
        </small>
      </Info>
    );
  } else if (shouldSwitchToLastBuildOnBranch) {
    details = (
      <Info>
        <span>
          <b>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link isButton onClick={switchToLastBuildOnBranch}>
              View latest snapshot
            </Link>
          </b>
        </span>
        <span>Newer test results are available for this story</span>
      </Info>
    );
  } else {
    details = (
      <Info>
        <span>
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
        </span>
        <small>
          {modeResults.length > 0 && (
            <span data-hidden-large>
              {pluralize("mode", modeResults.length, true)}
              {", "}
              {pluralize("browser", browserResults.length, true)}
            </span>
          )}
          {modeResults.length > 0 && <span data-hidden-large> • </span>}
          {isInProgress && <span>Test in progress...</span>}
          {!isInProgress && startedAt && (
            <span title={new Date(startedAt).toUTCString()}>Ran {startedAgo}</span>
          )}
        </small>
      </Info>
    );
  }

  return (
    <>
      {details}

      {showButton && (
        <Actions>
          <Button size="medium" variant="solid" onClick={startBuild} disabled={isRunning}>
            {isRunning ? <ProgressIcon parentComponent="Button" /> : <PlayIcon />}
            {isErrored ? "Rerun tests" : "Run tests"}
          </Button>
        </Actions>
      )}
    </>
  );
};
