import { DocumentIcon, SupportIcon } from '@storybook/icons';
import React from 'react';

import {
  Accordion,
  Accordions,
  CloseButton,
  CloseIcon,
  Heading,
} from '../../components/Accordions';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';

interface WarningsProps {
  onClose: () => void;
}

export const Warnings = ({ onClose }: WarningsProps) => (
  <Accordions>
    <Accordion>
      <Heading>
        Warnings
        <Badge status="warning">2</Badge>
        <CloseButton onClick={onClose}>
          <CloseIcon aria-label="Close" />
        </CloseButton>
      </Heading>
      <p>
        It&apos;s essential that your components and stories render in a consistent fashion to
        prevent false positives. Two issues detected in this story may cause false positives.
      </p>
      <p>
        <Button variant="outline">
          <DocumentIcon />
          Docs
        </Button>
        <Button variant="outline">
          <SupportIcon />
          Get support
        </Button>
      </p>
    </Accordion>
  </Accordions>
);
