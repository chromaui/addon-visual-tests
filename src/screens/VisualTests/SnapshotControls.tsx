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
import { darken, lighten } from 'polished';
import React from 'react';
import { ActionList, PopoverProvider } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { ActionButton } from '../../components/ActionButton';
import { ProgressIcon } from '../../components/icons/ProgressIcon';
import { Placeholder } from '../../components/Placeholder';
import { Text } from '../../components/Text';
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

const Action = styled(ActionList.Action)({
  height: 'auto',
  flex: '0 1 100%',
});

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
  side: 'left' | 'right';
  status?: 'positive';
}>(({ theme, side, status }) => ({
  ...(status === 'positive' && {
    backgroundColor: theme.background.positive,
    border: `1px solid ${lighten(0.35, theme.color.positive)}`,
    color: theme.color.positiveText,
    '&:hover': {
      backgroundColor: darken(0.05, theme.background.positive),
    },
  }),
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

      {(isAcceptable || isUnacceptable) && (
        <Actions showDivider={hasControls}>
          {userCanReview && buildIsReviewable && isAcceptable && selectedTest && (
            <div>
              <ReviewButton
                id="button-toggle-accept-story"
                disabled={isReviewing}
                ariaLabel="Accept this story"
                onClick={() => acceptTest(selectedTest.id, ReviewTestBatch.Spec)}
                side="left"
                variant="solid"
              >
                Accept
              </ReviewButton>

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
                  ariaLabel="Batch accept options"
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
            </div>
          )}

          {userCanReview && buildIsReviewable && isUnacceptable && (
            <div>
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
                  ariaLabel="Batch accept options"
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
            </div>
          )}

          {!(userCanReview && buildIsReviewable) && (
            <ActionButton readOnly tooltip="Reviewing disabled">
              <LockIcon />
            </ActionButton>
          )}

          <ActionButton
            ariaLabel={isOutdated ? 'Run new tests' : 'Rerun tests'}
            onClick={startBuild}
            disabled={isRunning}
            variant="outline"
          >
            {isOutdated ? <PlayIcon /> : <SyncIcon />}
          </ActionButton>
        </Actions>
      )}
    </>
  );
};
