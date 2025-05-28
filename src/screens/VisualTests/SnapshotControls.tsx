import {
  BatchAcceptIcon,
  ContrastIcon,
  LocationIcon,
  LockIcon,
  PlayIcon,
  SyncIcon,
  TransferIcon,
  UndoIcon,
} from '@storybook/icons';
import React from 'react';
import { WithTooltip } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { ActionButton, ButtonGroup } from '../../components/ActionButton';
import { IconButton } from '../../components/IconButton';
import { ProgressIcon } from '../../components/icons/ProgressIcon';
import { Placeholder } from '../../components/Placeholder';
import { Text } from '../../components/Text';
import { TooltipMenu } from '../../components/TooltipMenu';
import { TooltipNote } from '../../components/TooltipNote';
import { ComparisonResult, ReviewTestBatch, TestStatus } from '../../gql/graphql';
import { useSelectedStoryState } from './BuildContext';
import { useControlsDispatch, useControlsState } from './ControlsContext';
import { useReviewTestState } from './ReviewTestContext';
import { useRunBuildState } from './RunBuildContext';

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  margin: '8px 15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 6,

  span: {
    display: 'none',
    '@container (min-width: 300px)': {
      display: 'initial',
    },
  },

  '@container (min-width: 800px)': {
    borderLeft: `1px solid ${theme.appBorderColor}`,
    paddingLeft: 10,
    marginLeft: 0,
  },
}));

const Controls = styled.div({
  gridArea: 'controls',
  margin: '6px 10px 6px 15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,

  '@container (min-width: 800px)': {
    margin: 8,
  },
});

const DisabledIconWrapper = styled.div(({ theme }) => ({
  padding: 9,
  '> svg': {
    display: 'block',
  },
  path: {
    fill: theme.color.mediumdark,
  },
}));

const Actions = styled.div<{ showDivider?: boolean }>(({ theme, showDivider }) => ({
  gridArea: 'actions',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  margin: '0px 10px 0px 15px',
  gap: 6,

  '@container (min-width: 300px)': {
    alignItems: 'flex-start',
    margin: '15px 10px 15px 0px',
  },
  '@container (min-width: 800px)': {
    alignItems: 'center',
    borderLeft: showDivider ? `1px solid ${theme.appBorderColor}` : 'none',
    margin: '8px 10px 8px 0px',
    paddingLeft: 8,
  },
}));

export const SnapshotControls = ({ isOutdated }: { isOutdated: boolean }) => {
  const { baselineImageVisible, diffVisible, focusVisible } = useControlsState();
  const { toggleBaselineImage, toggleDiff, toggleFocus } = useControlsDispatch();
  const { isRunning, startBuild } = useRunBuildState();

  const { selectedTest, selectedComparison, summary } = useSelectedStoryState();
  const { changeCount, isInProgress } = summary;

  const { isReviewing, buildIsReviewable, userCanReview, acceptTest, unacceptTest } =
    useReviewTestState();

  if (isInProgress)
    return (
      <Controls>
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </Controls>
    );

  const isAcceptable = changeCount > 0 && selectedTest?.status !== TestStatus.Accepted;
  const isUnacceptable = changeCount > 0 && selectedTest?.status === TestStatus.Accepted;
  const hasControls = selectedComparison?.result === ComparisonResult.Changed;

  return (
    <>
      {hasControls && (
        <Label>
          <Text>
            <b>
              {baselineImageVisible ? 'Baseline' : 'Latest'}
              <span> snapshot</span>
            </b>
          </Text>
        </Label>
      )}

      {hasControls && (
        <Controls>
          <WithTooltip
            tooltip={
              <TooltipNote
                note={baselineImageVisible ? 'Show latest snapshot' : 'Show baseline snapshot'}
              />
            }
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-toggle-snapshot"
              aria-label={baselineImageVisible ? 'Show latest snapshot' : 'Show baseline snapshot'}
              onClick={() => toggleBaselineImage()}
            >
              <TransferIcon />
            </IconButton>
          </WithTooltip>
          <WithTooltip
            tooltip={<TooltipNote note={focusVisible ? 'Hide spotlight' : 'Show spotlight'} />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-toggle-spotlight"
              active={focusVisible}
              aria-label={focusVisible ? 'Hide spotlight' : 'Show spotlight'}
              onClick={() => toggleFocus(!focusVisible)}
            >
              <LocationIcon />
            </IconButton>
          </WithTooltip>
          <WithTooltip
            tooltip={<TooltipNote note={diffVisible ? 'Hide diff' : 'Show diff'} />}
            trigger="hover"
            hasChrome={false}
          >
            <IconButton
              id="button-diff-visible"
              active={diffVisible}
              aria-label={diffVisible ? 'Hide diff' : 'Show diff'}
              onClick={() => toggleDiff(!diffVisible)}
            >
              <ContrastIcon />
            </IconButton>
          </WithTooltip>
        </Controls>
      )}

      {(isAcceptable || isUnacceptable) && (
        <Actions showDivider={hasControls}>
          {userCanReview && buildIsReviewable && isAcceptable && selectedTest && (
            <ButtonGroup>
              <WithTooltip
                tooltip={<TooltipNote note="Accept this story" />}
                trigger="hover"
                hasChrome={false}
              >
                <ActionButton
                  id="button-toggle-accept-story"
                  disabled={isReviewing}
                  aria-label="Accept this story"
                  onClick={() => acceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                  side="left"
                >
                  Accept
                </ActionButton>
              </WithTooltip>
              <WithTooltip
                tooltip={<TooltipNote note="Batch accept options" />}
                trigger="hover"
                hasChrome={false}
              >
                <TooltipMenu
                  placement="bottom"
                  links={[
                    {
                      id: 'acceptComponent',
                      title: 'Accept component',
                      center: 'Accept all unreviewed changes for this component',
                      onClick: () => acceptTest(selectedTest.id, ReviewTestBatch.Component),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                    {
                      id: 'acceptBuild',
                      title: 'Accept entire build',
                      center: 'Accept all unreviewed changes for every story in the Storybook',
                      onClick: () => acceptTest(selectedTest.id, ReviewTestBatch.Build),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                  ]}
                >
                  {(active) => (
                    <ActionButton
                      square
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch accept options"
                      side="right"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <BatchAcceptIcon />
                      )}
                    </ActionButton>
                  )}
                </TooltipMenu>
              </WithTooltip>
            </ButtonGroup>
          )}

          {userCanReview && buildIsReviewable && isUnacceptable && (
            <ButtonGroup>
              <WithTooltip
                tooltip={<TooltipNote note="Unaccept this story" />}
                trigger="hover"
                hasChrome={false}
              >
                <ActionButton
                  id="button-toggle-accept-story"
                  disabled={isReviewing}
                  aria-label="Unaccept this story"
                  onClick={() => unacceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                  side="left"
                  status="positive"
                >
                  <UndoIcon />
                  Unaccept
                </ActionButton>
              </WithTooltip>
              <WithTooltip
                tooltip={<TooltipNote note="Batch unaccept options" />}
                trigger="hover"
                hasChrome={false}
              >
                <TooltipMenu
                  placement="bottom"
                  links={[
                    {
                      id: 'unacceptComponent',
                      title: 'Unaccept component',
                      center: 'Unaccept all unreviewed changes for this component',
                      onClick: () => unacceptTest(selectedTest.id, ReviewTestBatch.Component),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                    {
                      id: 'unacceptBuild',
                      title: 'Unaccept entire build',
                      center: 'Unaccept all unreviewed changes for every story in the Storybook',
                      onClick: () => unacceptTest(selectedTest.id, ReviewTestBatch.Build),
                      disabled: isReviewing,
                      loading: isReviewing,
                    },
                  ]}
                >
                  {(active) => (
                    <ActionButton
                      square
                      active={active}
                      disabled={isReviewing}
                      aria-label="Batch unaccept options"
                      side="right"
                      status="positive"
                    >
                      {isReviewing ? (
                        <ProgressIcon parentComponent="IconButton" />
                      ) : (
                        <BatchAcceptIcon />
                      )}
                    </ActionButton>
                  )}
                </TooltipMenu>
              </WithTooltip>
            </ButtonGroup>
          )}

          {!(userCanReview && buildIsReviewable) && (
            <WithTooltip
              tooltip={<TooltipNote note="Reviewing disabled" />}
              trigger="hover"
              hasChrome={false}
            >
              <DisabledIconWrapper>
                <LockIcon />
              </DisabledIconWrapper>
            </WithTooltip>
          )}

          <WithTooltip
            tooltip={<TooltipNote note={isOutdated ? 'Run new tests' : 'Rerun tests'} />}
            trigger="hover"
            hasChrome={false}
          >
            <ActionButton
              square
              aria-label={isOutdated ? 'Run new tests' : 'Rerun tests'}
              onClick={startBuild}
              disabled={isRunning}
              variant="outline"
            >
              {isOutdated ? <PlayIcon /> : <SyncIcon />}
            </ActionButton>
          </WithTooltip>
        </Actions>
      )}
    </>
  );
};
