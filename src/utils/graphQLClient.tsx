import { useAddonState } from "@storybook/manager-api";
import React from "react";
import { Client, fetchExchange, Provider } from "urql";
import { v4 as uuid } from "uuid";

import { ACCESS_TOKEN_KEY, ADDON_ID, CHROMATIC_API_URL } from "../constants";

export { Provider };

let currentToken: string = localStorage.getItem(ACCESS_TOKEN_KEY);
const accessTokenSharedStateKey = `${ADDON_ID}/accessToken`;

export const useAccessToken = () => {
  // We use an object rather than a straight boolean here due to https://github.com/storybookjs/storybook/pull/23991
  const [{ token }, setToken] = useAddonState<{ token: string | null }>(accessTokenSharedStateKey, {
    token: currentToken,
  });

  const updateToken = (newToken: string) => {
    currentToken = newToken;
    if (currentToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, currentToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    setToken({ token: newToken });
  };

  return [token, updateToken] as const;
};

const sessionId = uuid();

export const client = new Client({
  url: CHROMATIC_API_URL,
  exchanges: [fetchExchange], // no cacheExchange to prevent sharing data between stories
  fetchOptions: () => ({
    headers: {
      accept: "*/*", // workaround for https://github.com/mswjs/msw/issues/1593
      authorization: currentToken ? `Bearer ${currentToken}` : "",
      "x-chromatic-session-id": sessionId,
    },
  }),
});

export const storyWrapper = (Story: any) => (
  <Provider value={client}>
    <Story />
  </Provider>
);
