import React from "react";

import {
  Accordion,
  Accordions,
  CloseButton,
  CloseIcon,
  ContrastIcon,
  Heading,
  InfoIcon,
  ParagraphIcon,
  StopIcon,
  TimerIcon,
} from "../../components/Accordions";

interface ConfigurationProps {
  onClose: () => void;
}

export const Configuration = ({ onClose }: ConfigurationProps) => {
  return (
    <Accordions>
      <Accordion>
        <Heading>
          Configuration
          <InfoIcon />
          <CloseButton onClick={onClose}>
            <CloseIcon aria-label="Close" />
          </CloseButton>
        </Heading>
        <p>
          <TimerIcon />
          Delay: 300ms
        </p>
        <p>
          <StopIcon />
          Animation pause: Ends
        </p>
        <p>
          <ContrastIcon />
          Threshold: 0.2
        </p>
        <p>
          <ParagraphIcon />
          Anti-alias: Included
        </p>
      </Accordion>
    </Accordions>
  );
};
