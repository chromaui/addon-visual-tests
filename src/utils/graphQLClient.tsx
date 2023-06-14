import { useState } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

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
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: {
      accept: "*/*", // workaround for https://github.com/mswjs/msw/issues/1593
      authorization: currentToken ? `Bearer ${currentToken}` : "",
    },
  }),
});
