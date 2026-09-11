import {
  BatchAcceptIcon,
  ContrastIcon,
  EllipsisIcon,
  LocationIcon,
  LockIcon,
  PlayIcon,
  SyncIcon,
  TransferIcon,
  UndoIcon,
} from '@storybook/icons';
import { darken, lighten } from 'polished';
import React from 'react';
import { ActionList, PopoverProvider } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { ActionButton } from '../../components/ActionButton';
import { ProgressIcon } from '../../components/icons/ProgressIcon';
import { Placeholder } from '../../components/Placeholder';
import { Text } from '../../components/Text';
import { ComparisonResult, ReviewTestBatch, TestIgnoreReason, TestStatus } from '../../gql/graphql';
import { isIgnored } from '../../utils/summarizeTests';
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

const unquarantineConfirmation = `This test will no longer be ignored on all branches and may block new builds from passing.

We recommend removing quarantine only after the test is stable, you've accepted the new baseline, and all active branches include the baseline update.`;

const StyledAction = styled(ActionList.Action)({
  height: 'auto',
  flex: '0 1 100%',
});

// Menu items already show their label and description, so the ariaLabel tooltip is redundant
const Action = (props: React.ComponentProps<typeof StyledAction>) => (
  <StyledAction ariaLabel={false} {...props} />
);

const ActionContent = styled(ActionList.Text)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: '0 1 100%',
  padding: '8px 0',
  gap: 2,
  span: {
    color: theme.textMutedColor,
  },
}));

const ReviewButton = styled(ActionButton)<{
  side?: 'left' | 'right';
  status?: 'positive';
}>(({ theme, side, status }) => ({
  ...(status === 'positive' && {
    backgroundColor: theme.background.positive,
    border: `1px solid ${lighten(0.35, theme.color.positive)}`,
    color: theme.color.positiveText,
    '&:hover': {
      backgroundColor: darken(0.05, theme.background.positive),
    },
    // Hide the pair's inner divider so the two green buttons read as one control.
    '&&&': { boxShadow: 'none' },
  }),
  // Applied on the button itself so they beat ActionList.Button radius. Parent :has
  // selectors lost that fight after PopoverProvider wrapped the chevron.
  ...(side === 'left' && {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  }),
  ...(side === 'right' && {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft:
      status === 'positive' ? 'none' : `1px solid ${theme.base === 'dark' ? '#0006' : '#fff6'}`,
  }),
}));

const ReviewButtonPair = styled.div({
  display: 'inline-flex',
});

export const SnapshotControls = ({ isOutdated }: { isOutdated: boolean }) => {
  const { baselineImageVisible, diffVisible, focusVisible } = useControlsState();
  const { toggleBaselineImage, toggleDiff, toggleFocus } = useControlsDispatch();
  const { isRunning, startBuild } = useRunBuildState();

  const { selectedTest, selectedComparison, selectedTestHasChanges, summary } =
    useSelectedStoryState();
  const { changeCount, isInProgress } = summary;

  const {
    isReviewing,
    buildIsReviewable,
    userCanReview,
    acceptTest,
    unacceptTest,
    unquarantineTest,
  } = useReviewTestState();

  if (isInProgress)
    return (
      <Controls>
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </Controls>
    );

  const canReview = userCanReview && buildIsReviewable;
  const selectedIsIgnored = !!selectedTest && isIgnored(selectedTest.status);
  // Ignored tests don't count towards changeCount, so gate them on selectedTestHasChanges instead.
  // Batch review skips IGNORED tests, so ignored tests are accepted one at a time without batch options.
  const isAcceptable =
    !!selectedTest &&
    selectedTest.status !== TestStatus.Accepted &&
    (selectedIsIgnored ? selectedTestHasChanges : changeCount > 0);
  const isUnacceptable = changeCount > 0 && selectedTest?.status === TestStatus.Accepted;
  // Mirrors the webapp: Unquarantine is offered while the story is quarantined, also after accept.
  const isQuarantined = selectedTest?.ignoreReason === TestIgnoreReason.Quarantine;
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
          <ActionList.Button
            id="button-toggle-snapshot"
            size="small"
            ariaLabel={baselineImageVisible ? 'Show latest snapshot' : 'Show baseline snapshot'}
            onClick={() => toggleBaselineImage()}
          >
            <TransferIcon />
          </ActionList.Button>
          <ActionList.Toggle
            id="button-toggle-spotlight"
            size="small"
            pressed={focusVisible}
            ariaLabel={focusVisible ? 'Hide spotlight' : 'Show spotlight'}
            onClick={() => toggleFocus(!focusVisible)}
          >
            <LocationIcon />
          </ActionList.Toggle>
          <ActionList.Toggle
            id="button-diff-visible"
            size="small"
            pressed={diffVisible}
            ariaLabel={diffVisible ? 'Hide diff' : 'Show diff'}
            onClick={() => toggleDiff(!diffVisible)}
          >
            <ContrastIcon />
          </ActionList.Toggle>
        </Controls>
      )}

      {(isAcceptable || isUnacceptable || isQuarantined) && (
        <Actions showDivider={hasControls}>
          {canReview && isAcceptable && selectedTest && (
            <ReviewButtonPair>
              <ReviewButton
                id="button-toggle-accept-story"
                disabled={isReviewing}
                ariaLabel="Accept this story"
                onClick={() =>
                  acceptTest(selectedTest.id, selectedIsIgnored ? undefined : ReviewTestBatch.Spec)
                }
                side={selectedIsIgnored ? undefined : 'left'}
                variant="solid"
              >
                {isReviewing && selectedIsIgnored ? (
                  <ProgressIcon parentComponent="IconButton" />
                ) : null}
                Accept
              </ReviewButton>

              {selectedIsIgnored ? null : (
                <PopoverProvider
                  padding={0}
                  popover={({ onHide }) => (
                    <ActionList>
                      <ActionList.Item>
                        <Action
                          ariaLabel="Accept component"
                          disabled={isReviewing}
                          onClick={() => {
                            acceptTest(selectedTest.id, ReviewTestBatch.Component);
                            onHide();
                          }}
                        >
                          <ActionContent>
                            <strong>Accept component</strong>
                            <span>Accept all unreviewed changes for this component</span>
                          </ActionContent>
                        </Action>
                      </ActionList.Item>
                      <ActionList.Item>
                        <Action
                          ariaLabel="Accept entire build"
                          disabled={isReviewing}
                          onClick={() => {
                            acceptTest(selectedTest.id, ReviewTestBatch.Build);
                            onHide();
                          }}
                        >
                          <ActionContent>
                            <strong>Accept entire build</strong>
                            <span>
                              Accept all unreviewed changes for every story in the Storybook
                            </span>
                          </ActionContent>
                        </Action>
                      </ActionList.Item>
                    </ActionList>
                  )}
                >
                  <ReviewButton
                    disabled={isReviewing}
                    ariaLabel="Open batch accept options"
                    side="right"
                    variant="solid"
                  >
                    {isReviewing ? (
                      <ProgressIcon parentComponent="IconButton" />
                    ) : (
                      <BatchAcceptIcon />
                    )}
                  </ReviewButton>
                </PopoverProvider>
              )}
            </ReviewButtonPair>
          )}

          {canReview && isUnacceptable && (
            <ReviewButtonPair>
              <ReviewButton
                id="button-toggle-accept-story"
                disabled={isReviewing}
                ariaLabel="Unaccept this story"
                onClick={() => unacceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                side="left"
                variant="solid"
                status="positive"
              >
                <UndoIcon />
                Unaccept
              </ReviewButton>

              <PopoverProvider
                padding={0}
                popover={({ onHide }) => (
                  <ActionList>
                    <ActionList.Item>
                      <Action
                        ariaLabel="Unaccept component"
                        disabled={isReviewing}
                        onClick={() => {
                          unacceptTest(selectedTest.id, ReviewTestBatch.Component);
                          onHide();
                        }}
                      >
                        <ActionContent>
                          <strong>Unaccept component</strong>
                          <span>Unaccept all unreviewed changes for this component</span>
                        </ActionContent>
                      </Action>
                    </ActionList.Item>
                    <ActionList.Item>
                      <Action
                        ariaLabel="Unaccept entire build"
                        disabled={isReviewing}
                        onClick={() => {
                          unacceptTest(selectedTest.id, ReviewTestBatch.Build);
                          onHide();
                        }}
                      >
                        <ActionContent>
                          <strong>Unaccept entire build</strong>
                          <span>
                            Unaccept all unreviewed changes for every story in the Storybook
                          </span>
                        </ActionContent>
                      </Action>
                    </ActionList.Item>
                  </ActionList>
                )}
              >
                <ReviewButton
                  disabled={isReviewing}
                  ariaLabel="Open batch unaccept options"
                  side="right"
                  variant="solid"
                  status="positive"
                >
                  {isReviewing ? (
                    <ProgressIcon parentComponent="IconButton" />
                  ) : (
                    <BatchAcceptIcon />
                  )}
                </ReviewButton>
              </PopoverProvider>
            </ReviewButtonPair>
          )}

          {!canReview && (
            <ActionButton readOnly tooltip="Reviewing disabled">
              <LockIcon />
            </ActionButton>
          )}

          {canReview && isQuarantined && selectedTest ? (
            // Unquarantine is too wide to sit next to the other actions at narrow panel widths, so
            // it shares an overflow menu with Rerun whenever it applies.
            <PopoverProvider
              padding={0}
              popover={({ onHide }) => (
                <ActionList>
                  <ActionList.Item>
                    <Action
                      ariaLabel={isOutdated ? 'Run new tests' : 'Rerun tests'}
                      disabled={isRunning}
                      onClick={() => {
                        startBuild();
                        onHide();
                      }}
                    >
                      <ActionContent>
                        <strong>{isOutdated ? 'Run new tests' : 'Rerun tests'}</strong>
                        <span>Take new snapshots of every story in the Storybook</span>
                      </ActionContent>
                    </Action>
                  </ActionList.Item>
                  <ActionList.Item>
                    <Action
                      id="button-unquarantine-story"
                      ariaLabel="Unquarantine this story"
                      disabled={isReviewing}
                      onClick={() => {
                        onHide();
                        // Same confirmation as the webapp; a native confirm keeps this a one-liner
                        if (window.confirm(unquarantineConfirmation)) {
                          unquarantineTest(selectedTest.id);
                        }
                      }}
                    >
                      <ActionContent>
                        <strong>Unquarantine</strong>
                        <span>Stop ignoring changes to this story</span>
                      </ActionContent>
                    </Action>
                  </ActionList.Item>
                </ActionList>
              )}
            >
              <ActionButton ariaLabel="More actions" variant="outline">
                <EllipsisIcon />
              </ActionButton>
            </PopoverProvider>
          ) : (
            <ActionButton
              ariaLabel={isOutdated ? 'Run new tests' : 'Rerun tests'}
              onClick={startBuild}
              disabled={isRunning}
              variant="outline"
            >
              {isOutdated ? <PlayIcon /> : <SyncIcon />}
            </ActionButton>
          )}
        </Actions>
      )}
    </>
  );
};
