import { ChevronLeftIcon, QuestionIcon } from '@storybook/icons';
import React from 'react';
import { WithTooltip } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { IconButton } from '../../components/IconButton';
import { Bar, Col } from '../../components/layout';
import { TooltipNote } from '../../components/TooltipNote';

const HeaderButton = styled(IconButton)(({ theme }) => ({
  color: theme.base === 'light' ? 'currentColor' : theme.color.medium,
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.bold,
}));

interface AuthHeaderProps {
  onBack?: () => void;
}

export const AuthHeader = ({ onBack }: AuthHeaderProps) => (
  <Bar>
    {onBack && (
      <Col>
        <HeaderButton onClick={onBack}>
          <ChevronLeftIcon />
          Back
        </HeaderButton>
      </Col>
    )}
    <Col push>
      <WithTooltip
        as="div"
        hasChrome={false}
        trigger="hover"
        tooltip={<TooltipNote note="Learn about visual tests" />}
      >
        <HeaderButton asChild>
          <a href="https://www.chromatic.com/storybook" target="_blank">
            <QuestionIcon />
          </a>
        </HeaderButton>
      </WithTooltip>
    </Col>
  </Bar>
);
