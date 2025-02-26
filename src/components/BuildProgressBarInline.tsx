import React from 'react';
import { styled } from 'storybook/internal/theming';

import { LocalBuildProgress } from '../types';
import { BuildProgressLabel } from './BuildProgressLabel';
import { ProgressBar, ProgressTrack } from './SidebarTopButton';
import { Text } from './Text';

const ProgressTextWrapper = styled(Text)({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 200,
  marginTop: 15,
});

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
