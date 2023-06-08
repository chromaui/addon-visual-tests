import { useState } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

export { Provider };

const STORAGE_KEY = "chromaticAccessToken";

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
  url: "https://www.staging-chromatic.com/api",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: { authorization: currentToken ? `Bearer ${currentToken}` : "" },
  }),
});
