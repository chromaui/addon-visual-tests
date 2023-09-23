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
  pixelDiff: number | undefined;
  onClose: () => void;
}

function isSquare(number: number) {
  const sqrt = Math.sqrt(number);
  return Math.floor(sqrt) === sqrt;
}

export const RenderSettings = ({ pixelDiff, onClose }: RenderSettingsProps) => {
  return (
    <Accordions>
      <Accordion>
        <Heading>
          Render details
          <InfoIcon icon="info" />
          <CloseButton onClick={onClose}>
            <CloseIcon icon="close" aria-label="Close" />
          </CloseButton>
        </Heading>
        {/* <p>
          <ItemIcon icon="timer" />
          Delay: 300ms
        </p>
        <p>
          <ItemIcon icon="stop" />
          Animation pause: End
        </p> */}
        <p>
          <ItemIcon icon="contrast" />
          Pixel Diff: {pixelDiff ? `${pixelDiff} pixels` : "No diff, that's boring!"}
        </p>
        <p>
          {pixelDiff &&
            (isSquare(pixelDiff) ? (
              <>
                <ItemIcon icon="paragraph" />
                YOUR CODE IS <b>ABC12</b>
              </>
            ) : (
              <>
                <ItemIcon icon="paragraph" />
                That's a fun diff but sometime's its hip to be square
              </>
            ))}
        </p>
      </Accordion>
      {/* <Accordion>
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
      </Accordion> */}
    </Accordions>
  );
};
