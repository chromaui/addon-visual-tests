import React, { useState } from "react";
import { Client, fetchExchange, Provider } from "urql";

import { CHROMATIC_BASE_URL, STORAGE_KEY } from "../constants";

export { Provider };

let currentToken: string = localStorage.getItem(STORAGE_KEY);

export const useAccessToken = () => {
  const [token, setToken] = useState(currentToken);

  const updateToken = (newToken: string) => {
    currentToken = newToken;
    localStorage.setItem(STORAGE_KEY, currentToken);
    setToken(newToken);
  };

  return [token, updateToken] as const;
};

export const client = new Client({
  url: `${CHROMATIC_BASE_URL}/api`,
  exchanges: [fetchExchange], // no cacheExchange to prevent sharing data between stories
  fetchOptions: () => ({
    headers: {
      accept: "*/*", // workaround for https://github.com/mswjs/msw/issues/1593
      authorization: currentToken ? `Bearer ${currentToken}` : "",
    },
  }),
});

export const storyWrapper = (Story: any) => (
  <Provider value={client}>
    <Story />
  </Provider>
);
