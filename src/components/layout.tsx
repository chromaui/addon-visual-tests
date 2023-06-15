import { css, styled } from "@storybook/theming";

export const Sections = styled.div({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

export const Section = styled.div(({ theme }) => ({
  "& + &": {
    borderTop: `1px solid ${theme.color.border}`,
  },
}));

export const Row = styled.div({
  display: "flex",
  flexDirection: "row",
  // justifyContent: "space-between",
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
  ({ push }) => push && css({ marginLeft: "auto" })
);

export const Text = styled.div(({ theme }) => ({
  lineHeight: "18px",
  color: `${theme.color.defaultText}99`,
  b: {
    color: theme.color.defaultText,
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
