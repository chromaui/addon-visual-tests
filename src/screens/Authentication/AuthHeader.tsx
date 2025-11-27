import { ChevronLeftIcon, QuestionIcon } from '@storybook/icons';
import React from 'react';
import { ActionList } from 'storybook/internal/components';

import { Bar, Col } from '../../components/layout';

interface AuthHeaderProps {
  onBack?: () => void;
}

export const AuthHeader = ({ onBack }: AuthHeaderProps) => (
  <Bar>
    {onBack && (
      <Col>
        <ActionList.Button ariaLabel="Go back" onClick={onBack}>
          <ChevronLeftIcon />
          Back
        </ActionList.Button>
      </Col>
    )}
    <Col push>
      <ActionList.Button asChild ariaLabel="Learn about visual tests">
        <a href="https://www.chromatic.com/storybook" target="_blank">
          <QuestionIcon />
        </a>
      </ActionList.Button>
    </Col>
  </Bar>
);
