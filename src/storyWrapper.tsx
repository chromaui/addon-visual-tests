import { styled, typography } from "@storybook/theming";
import React from "react";

import { Provider, client } from "./utils/graphQLClient";

const Wrapper = styled.div({
  width: "100vw",
  height: "100vh",

  "*": {
    boxSizing: "border-box",
    fontFamily: typography.fonts.base,
    fontSize: typography.size.s2 - 1,
  },
});

export const storyWrapper = (Story: any) => (
  <Provider value={client}>
    <Wrapper>
      <Story />
    </Wrapper>
  </Provider>
);
