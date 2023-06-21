import { Icons } from "@storybook/components";
import { styled } from "@storybook/theming";

import { IconButton } from "./IconButton";

export const Accordions = styled.div({
  display: "flex",
  flexDirection: "column",
});

export const Accordion = styled.div(({ theme }) => ({
  padding: 15,
  lineHeight: "18px",
  borderBottom: `1px solid ${theme.color.border}`,

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

export const InfoIcon = styled(Icons)(({ theme }) => ({
  width: 12,
  height: 12,
  margin: "3px 6px",
  verticalAlign: "top",
  color: theme.color.mediumdark,
}));

export const ItemIcon = styled(Icons)({
  width: 14,
  height: 14,
  margin: "2px 6px 2px 0",
  verticalAlign: "top",
});

export const CloseIcon = styled(Icons)({
  marginLeft: "auto",
});

export const CloseButton: typeof IconButton = styled(IconButton)({
  margin: -5,
  marginLeft: "auto",
});
