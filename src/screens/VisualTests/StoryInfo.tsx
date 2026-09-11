import { PlayIcon } from '@storybook/icons';
import pluralize from 'pluralize';
import React from 'react';
import { Link, TooltipMessage, WithTooltip } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { ActionButton } from '../../components/ActionButton';
import { Badge } from '../../components/Badge';
import { AlertIcon } from '../../components/icons/AlertIcon';
import { ProgressIcon } from '../../components/icons/ProgressIcon';
import { StatusIcon } from '../../components/icons/StatusIcon';
import { StoryTestFieldsFragment, TestIgnoreReason, TestStatus } from '../../gql/graphql';
import { formatDate } from '../../utils/formatDate';
import {
  getIgnoreBadgeLabel,
  hasVisualChanges,
  shouldShowUnstableBadge,
  summarizeTests,
} from '../../utils/summarizeTests';
import { useRunBuildState } from './RunBuildContext';

const Info = styled.div(({ theme }) => ({
  gridArea: 'info',
  display: 'flex',
  justifySelf: 'start',
  justifyContent: 'center',
  flexDirection: 'column',
  margin: 15,
  lineHeight: '18px',
  color: theme.base === 'light' ? `${theme.color.defaultText}99` : `${theme.color.light}99`,
  fontSize: theme.typography.size.s2,

  b: {
    color: theme.base === 'light' ? `${theme.color.defaultText}` : `${theme.color.light}`,
  },
  small: {
    fontSize: theme.typography.size.s2 - 1,
  },

  // The badge carries no left margin so it lines up with the text when it wraps; the headline
  // provides the spacing instead while they share a line.
  '[data-has-badge] > b': {
    marginRight: 8,
  },

  '@container (min-width: 800px)': {
    margin: '6px 10px 6px 15px',
    alignItems: 'center',
    flexDirection: 'row',

    small: {
      fontSize: 'inherit',
    },

    '[data-has-badge] > b': {
      marginRight: 0,
    },

    '[data-hidden-large]': {
      display: 'none',
    },

    '& > span:first-of-type': {
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      marginRight: 6,
    },
  },
}));

const ignoreNotes: Record<TestIgnoreReason, string> = {
  [TestIgnoreReason.Quarantine]:
    'This test was ignored across all branches. It will no longer block builds from passing. We continue taking snapshots of unstable tests to track stability over time for debugging.',
  [TestIgnoreReason.Manual]:
    'This test was temporarily skipped and does not block the current build from passing.',
  [TestIgnoreReason.Unstable]:
    'This test appears inconsistently every time it renders. Chromatic auto-ignored it to prevent it from blocking the current build.',
};

const unstableNote =
  'This test appears inconsistently every time it renders. Unstable tests can block your CI.';

// Keeps the ignore badge and status icon together when the headline wraps at narrow widths
// Keeps the ignore badge and status icon together and vertically centered. Only used when there is
// a badge, since the wrapper changes the icon's line box.
const StatusGroup = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  gap: 6,

  // StatusIcon sets margin inline so it can sit next to headline text. Gap replaces that here.
  svg: {
    margin: '0 !important',
  },

  '@container (min-width: 800px)': {
    marginLeft: 6,
  },
});

// No left margin so it aligns with the text when wrapped; the headline provides spacing instead
const IgnoreBadge = styled(Badge)({
  margin: 0,
});

const Actions = styled.div({
  gridArea: 'actions',
  display: 'flex',
  justifySelf: 'end',
  justifyContent: 'center',
  alignItems: 'start',
  margin: 15,
  marginRight: 10,

  '@container (min-width: 800px)': {
    margin: '6px 10px 0 0',
  },
});

interface StoryInfoSectionProps {
  /** A new build has been started but not yet announced. The current build is now out of date */
  isStarting: boolean;
  /** Once the test has reached the started status, this is the tests of this story */
  tests?: StoryTestFieldsFragment[];
  /** The test for the currently selected mode, used for the ignore/quarantine badge */
  selectedTest?: StoryTestFieldsFragment;
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
  selectedTest,
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

  const selectedHasChanges = hasVisualChanges(selectedTest?.result);
  const isQuarantined = selectedTest?.ignoreReason === TestIgnoreReason.Quarantine;
  // SnapshotControls occupies the same `actions` grid area for Accept and the
  // overflow menu. Ignored tests don't increment changeCount, so also hide when
  // those review actions will render.
  const showButton =
    (isErrored || isOutdated) &&
    !isRunningStory &&
    !changeCount &&
    !selectedHasChanges &&
    !isQuarantined;
  const ignoreBadgeLabel = getIgnoreBadgeLabel(selectedTest);
  const showUnstableBadge = shouldShowUnstableBadge(selectedTest);
  const ignoreReason = selectedTest?.ignoreReason ?? TestIgnoreReason.Manual;
  const hasBadge = !!ignoreBadgeLabel || showUnstableBadge;

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
            <Link isButton onClick={switchToLastBuildOnBranch}>
              View latest snapshot
            </Link>
          </b>
        </span>
        <span>Newer test results are available for this story</span>
      </Info>
    );
  } else {
    const statusIcon = (
      <StatusIcon
        icon={brokenCount ? 'failed' : status === TestStatus.Pending ? 'changed' : 'passed'}
      />
    );
    details = (
      <Info>
        <span data-has-badge={hasBadge ? '' : undefined}>
          <b>
            {brokenCount
              ? null
              : changeCount
                ? `${pluralize('change', changeCount, true)}${
                    status === TestStatus.Accepted ? ' accepted' : ''
                  }`
                : 'No changes'}
            {brokenCount ? pluralize('error', brokenCount, true) : null}
          </b>
          {hasBadge ? (
            <StatusGroup>
              {showUnstableBadge ? (
                <WithTooltip placement="bottom" tooltip={<TooltipMessage desc={unstableNote} />}>
                  <IgnoreBadge status="neutral">Unstable</IgnoreBadge>
                </WithTooltip>
              ) : null}
              {ignoreBadgeLabel ? (
                <WithTooltip
                  placement="bottom"
                  tooltip={<TooltipMessage desc={ignoreNotes[ignoreReason]} />}
                >
                  {/* Quarantined is solid red, matching the webapp's pill */}
                  <IgnoreBadge
                    status={ignoreReason === TestIgnoreReason.Quarantine ? 'critical' : 'neutral'}
                  >
                    {ignoreBadgeLabel}
                  </IgnoreBadge>
                </WithTooltip>
              ) : null}
              {statusIcon}
            </StatusGroup>
          ) : (
            statusIcon
          )}
        </span>
        <small>
          {modeResults.length > 0 && (
            <span data-hidden-large>
              {pluralize('mode', modeResults.length, true)}
              {', '}
              {pluralize('browser', browserResults.length, true)}
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
          <ActionButton ariaLabel={false} onClick={startBuild} disabled={isRunning} variant="solid">
            {isRunning ? <ProgressIcon parentComponent="Button" /> : <PlayIcon />}
            {isErrored ? 'Rerun tests' : 'Run tests'}
          </ActionButton>
        </Actions>
      )}
    </>
  );
};
