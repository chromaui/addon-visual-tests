import {
  CloseIcon as Close,
  ContrastIcon as Contrast,
  InfoIcon as Info,
  ParagraphIcon as Paragraph,
  StopIcon as Stop,
  TimerIcon as Timer,
} from "@storybook/icons";
import { styled } from "@storybook/theming";

import { IconButton } from "./IconButton";

export const Accordions = styled.div({
  display: "flex",
  flexDirection: "column",
});

export const Accordion = styled.div(({ theme }) => ({
  padding: 15,
  lineHeight: "18px",
  borderBottom: `1px solid ${theme.appBorderColor}`,

  p: {
    margin: "10px 0",
    "&:last-of-type": {
      marginBottom: 0,
    },
  },

  dl: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 10,
    margin: "10px 0 0 0",
  },

  dt: {
    color: theme.color.mediumdark,
    fontWeight: 700,
  },

  dd: {
    marginLeft: 0,
  },

  "button + button": {
    marginLeft: 10,
  },
}));

export const Heading = styled.div({
  display: "flex",
  fontWeight: "bold",
  marginBottom: 15,
});

export const InfoIcon = styled(Info)(({ theme }) => ({
  width: 12,
  height: 12,
  margin: "3px 6px",
  verticalAlign: "top",
  color: theme.color.mediumdark,
}));

const itemIconStyle = {
  width: 14,
  height: 14,
  margin: "2px 6px 2px 0",
  verticalAlign: "top",
};
export const TimerIcon = styled(Timer)(itemIconStyle);
export const StopIcon = styled(Stop)(itemIconStyle);
export const ContrastIcon = styled(Contrast)(itemIconStyle);
export const ParagraphIcon = styled(Paragraph)(itemIconStyle);

export const CloseIcon = styled(Close)({
  marginLeft: "auto",
});

export const CloseButton: typeof IconButton = styled(IconButton)({
  margin: -5,
  marginLeft: "auto",
});
