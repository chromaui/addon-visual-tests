import React from 'react';
import { styled } from 'storybook/theming';

import { LocalBuildProgress } from '../types';
import { BuildProgressLabel } from './BuildProgressLabel';
import { Text } from './Text';

const ProgressTextWrapper = styled(Text)({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 200,
  marginTop: 15,
});

const ProgressTrack = styled.div(({ theme }) => ({
  height: 5,
  background: theme.background.hoverable,
  borderRadius: 5,
  overflow: 'hidden',
}));

const ProgressBar = styled(ProgressTrack)(({ theme }) => ({
  background: theme.color.secondary,
  transition: 'width 3s ease-out',
}));

export function BuildProgressInline({
  localBuildProgress,
}: {
  localBuildProgress: LocalBuildProgress;
}) {
  return (
    <ProgressTextWrapper center small>
      <ProgressTrack>
        {typeof localBuildProgress.buildProgressPercentage === 'number' && (
          <ProgressBar style={{ width: `${localBuildProgress.buildProgressPercentage}%` }} />
        )}
      </ProgressTrack>
      <BuildProgressLabel center muted small localBuildProgress={localBuildProgress} />
    </ProgressTextWrapper>
  );
}
