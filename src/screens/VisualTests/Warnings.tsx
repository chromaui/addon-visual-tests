import { Icons } from "@storybook/components";
import React from "react";

import {
  Accordion,
  Accordions,
  CloseButton,
  CloseIcon,
  Heading,
} from "../../components/Accordions";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

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
          <CloseIcon icon="close" aria-label="Close" />
        </CloseButton>
      </Heading>
      <p>
        It’s essential that your components and stories render in a consistent fashion to prevent
        false positives. Two issues detected in this story may cause false positives.
      </p>
      <p>
        <Button outline>
          <Icons icon="document" />
          Docs
        </Button>
        <Button outline>
          <Icons icon="support" />
          Get support
        </Button>
      </p>
    </Accordion>
  </Accordions>
);
