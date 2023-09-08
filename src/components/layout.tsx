import { styled } from "@storybook/theming";

export const Sections = styled.div<{ hidden?: boolean }>(
  {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  ({ hidden }) => hidden && { display: "none" }
);

export const Section = styled.div<{ grow?: boolean }>(({ grow, theme }) => ({
  flexGrow: grow ? 1 : "auto",
  borderBottom: `1px solid ${theme.color.border}`,
  "&:last-of-type": {
    borderBottom: 0,
  },
}));

export const Row = styled.div({
  display: "flex",
  flexDirection: "row",
  margin: 15,
});

export const Bar = styled(Row)({
  alignItems: "center",
  height: 40,
  margin: "0 10px",
});

export const Col = styled.div<{ push?: boolean }>(
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "&:not(:last-of-type)": {
      marginRight: 6,
    },
  },
  ({ push }) => push && { marginLeft: "auto" }
);

export const Text = styled.div(({ theme }) => ({
  lineHeight: "18px",
  color: `${theme.color.defaultText}99`,
  b: {
    color: theme.color.defaultText,
  },
  code: {
    fontSize: theme.typography.size.s1,
    border: `1px solid ${theme.color.border}`,
    borderRadius: 3,
    padding: "0 3px",
  },
  small: {
    fontSize: theme.typography.size.s1,
  },
  span: {
    whiteSpace: "nowrap",
  },
  svg: {
    verticalAlign: "top",
  },
}));
