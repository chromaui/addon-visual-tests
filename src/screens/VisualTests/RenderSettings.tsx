import React from "react";

import {
  Accordion,
  Accordions,
  CloseButton,
  CloseIcon,
  Heading,
  InfoIcon,
  ItemIcon,
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
          <InfoIcon icon="info" />
          <CloseButton onClick={onClose}>
            <CloseIcon icon="close" aria-label="Close" />
          </CloseButton>
        </Heading>
        <p>
          <ItemIcon icon="timer" />
          Delay: 300ms
        </p>
        <p>
          <ItemIcon icon="stop" />
          Animation pause: Ends
        </p>
        <p>
          <ItemIcon icon="contrast" />
          Threshold: 0.2
        </p>
        <p>
          <ItemIcon icon="paragraph" />
          Anti-alias: Included
        </p>
      </Accordion>
      <Accordion>
        <Heading>
          Bounding box
          <InfoIcon icon="info" />
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
