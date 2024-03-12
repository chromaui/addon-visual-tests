import { styled } from "@storybook/theming";

import { Text as BaseText } from "./Text";

export const Base = styled.div<{ hidden?: boolean }>(({ hidden, theme }) => ({
  background: theme.background.app,
  containerType: "size",
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  height: "100%",
}));

export const Sections = styled.div<{ hidden?: boolean }>(
  { display: "flex", flexDirection: "column", flexGrow: 1 },
  ({ hidden }) => hidden && { display: "none" }
);

export const Section = styled.div<{ grow?: boolean }>(
  ({ grow }) => grow && { flexGrow: grow ? 1 : "auto" }
);

export const Row = styled.div<{ header?: boolean }>(
  {
    display: "flex",
    flexDirection: "row",
    margin: 15,
  },
  ({ header, theme }) =>
    header && {
      margin: 0,
      padding: 15,
      borderBottom: `1px solid ${theme.appBorderColor}`,

      "@container (min-width: 800px)": {
        height: 40,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 15px",
      },
    }
);

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
  },
  ({ push }) => push && { marginLeft: "auto" }
);
