import { DocumentIcon } from '@storybook/icons';
import React from 'react';
import { Link } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { BuildProgressInline } from '../../components/BuildProgressBarInline';
import { Button } from '../../components/Button';
import { Code } from '../../components/Code';
import { Container } from '../../components/Container';
import { Eyebrow } from '../../components/Eyebrow';
import { Heading } from '../../components/Heading';
import { Section, Sections } from '../../components/layout';
import { Screen } from '../../components/Screen';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { BuildStatus, TestResult } from '../../gql/graphql';
import { LocalBuildProgress } from '../../types';
import { useBuildState, useSelectedBuildState, useSelectedStoryState } from './BuildContext';
import { BuildEyebrow } from './BuildEyebrow';
import { useReviewTestState } from './ReviewTestContext';
import { useRunBuildState } from './RunBuildContext';
import { SnapshotComparison } from './SnapshotComparison';

interface BuildResultsProps {
  branch: string;
  dismissBuildError: () => void;
  isOutdated: boolean;
  localBuildProgress?: LocalBuildProgress;
  switchToLastBuildOnBranch?: () => void;
  storyId: string;
}

export const Warning = styled.div(({ theme }) => ({
  color: theme.color.warning,
  background: theme.background.warning,
  padding: 10,
  lineHeight: '18px',
  position: 'relative',
}));

export const BuildResults = ({
  branch,
  dismissBuildError,
  isOutdated,
  localBuildProgress,
  switchToLastBuildOnBranch,
  storyId,
}: BuildResultsProps) => {
  const { isRunning, startBuild, stopBuild } = useRunBuildState();

  const { lastBuildOnBranch, lastBuildOnBranchIsReady, lastBuildOnBranchIsSelectable } =
    useBuildState();

  const selectedBuild = useSelectedBuildState();
  const selectedStory = useSelectedStoryState();

  const { buildIsReviewable, userCanReview } = useReviewTestState();

  // Do we want to encourage them to switch to the next build?
  const shouldSwitchToLastBuildOnBranch = !!(
    !buildIsReviewable &&
    lastBuildOnBranchIsReady &&
    lastBuildOnBranchIsSelectable &&
    !!switchToLastBuildOnBranch
  );

  const lastBuildOnBranchInProgress = lastBuildOnBranch?.status === BuildStatus.InProgress;
  const showBuildStatus =
    // We always want to show the status of the running build (until it is done)
    isRunning ||
    // Even if there's no build running, we need to tell them why they can't review, unless
    // the story is superseded and the UI is already telling them
    (!buildIsReviewable && !shouldSwitchToLastBuildOnBranch);
  const localBuildProgressIsLastBuildOnBranch =
    localBuildProgress && localBuildProgress?.buildId === lastBuildOnBranch?.id;

  const buildStatus = showBuildStatus && (
    <BuildEyebrow
      branch={branch}
      dismissBuildError={dismissBuildError}
      localBuildProgress={
        localBuildProgressIsLastBuildOnBranch || isRunning ? localBuildProgress : undefined
      }
      lastBuildOnBranchInProgress={lastBuildOnBranchInProgress}
      switchToLastBuildOnBranch={switchToLastBuildOnBranch}
    />
  );

  // If we loaded tests for the build (if started/completed) but there are no tests for the selected
  // story, then the story must be new since it doesn't exist in the last build.
  const isNewStory = selectedStory?.hasTests && selectedStory?.tests.length === 0;

  const isLocalBuildProgressOnSelectedBuild =
    selectedBuild.id !== `Build:${localBuildProgress?.buildId}`;

  if (isNewStory) {
    return (
      <Screen>
        <Container>
          {localBuildProgress && isLocalBuildProgressOnSelectedBuild ? (
            <Stack>
              <div>
                <Heading>Snapshotting new story</Heading>
                <Text center muted>
                  A new snapshot is being created in a standardized cloud browser to save its
                  &quot;last known good state&quot; as a test baseline.
                </Text>
              </div>
              <BuildProgressInline localBuildProgress={localBuildProgress} />
            </Stack>
          ) : (
            <Stack>
              <div>
                <Heading>New story found</Heading>
                <Text center muted>
                  Take an image snapshot of this story to save its &quot;last known good state&quot;
                  as a test baseline. This unlocks visual regression testing so you can see exactly
                  what has changed down to the pixel.
                </Text>
              </div>
              <Button
                ariaLabel={false}
                belowText
                size="medium"
                variant="solid"
                onClick={isRunning ? stopBuild : startBuild}
              >
                {isRunning ? 'Cancel build' : 'Create visual test'}
              </Button>
            </Stack>
          )}
        </Container>
      </Screen>
    );
  }

  // It shouldn't be possible for one test to be skipped but not all of them
  const isSkipped = !!selectedStory?.tests?.find((t) => t.result === TestResult.Skipped);
  if (isSkipped) {
    return (
      <Screen>
        {buildStatus}
        <Container>
          <Stack>
            <div>
              <Heading>This story was skipped</Heading>
              <Text center muted>
                If you would like to resume testing it, comment out or remove
                <Code>disableSnapshot = true</Code> from the CSF file.
              </Text>
            </div>
            <Button ariaLabel={false} asChild size="medium" variant="outline">
              <a
                href="https://www.chromatic.com/docs/disable-snapshots#with-storybook"
                target="_new"
              >
                <DocumentIcon />
                View docs
              </a>
            </Button>
          </Stack>
        </Container>
      </Screen>
    );
  }

  const { status } = selectedBuild;
  const isSelectedBuildStarting = [
    BuildStatus.Announced,
    BuildStatus.Published,
    BuildStatus.Prepared,
  ].includes(status);
  const isBuildFailed = status === BuildStatus.Failed;
  const isReviewLocked = status === BuildStatus.Pending && (!userCanReview || !buildIsReviewable);

  return (
    <Screen footer={null}>
      <Sections>
        {buildStatus}

        {!buildStatus && isReviewLocked && (
          <Eyebrow>
            {userCanReview ? (
              <>
                Reviewing is disabled because there&apos;s a newer build on <Code>{branch}</Code>.
              </>
            ) : (
              <>
                You don&apos;t have permission to accept changes.{' '}
                <Link
                  href="https://www.chromatic.com/docs/collaborators#roles"
                  target="_blank"
                  withArrow
                >
                  Learn about roles
                </Link>
              </>
            )}
          </Eyebrow>
        )}

        <Section grow>
          <SnapshotComparison
            {...{
              isOutdated,
              isStarting: isSelectedBuildStarting,
              isBuildFailed,
              shouldSwitchToLastBuildOnBranch,
              switchToLastBuildOnBranch,
              selectedBuild,
              storyId,
            }}
          />
        </Section>
      </Sections>
    </Screen>
  );
};
