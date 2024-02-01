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

interface RenderSettingsProps {
  onClose: () => void;
}

export const RenderSettings = ({ onClose }: RenderSettingsProps) => {
  return (
    <Accordions>
      <Accordion>
        <Heading>
          Render settings
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
      <Accordion>
        <Heading>
          Bounding box
          <InfoIcon />
        </Heading>
        <dl>
          <dt>Width:</dt>
          <dd>Fill viewport</dd>
          <dt>Height:</dt>
          <dd>Hug contents</dd>
        </dl>
      </Accordion>
    </Accordions>
  );
};
