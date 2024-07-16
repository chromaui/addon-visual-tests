import { useChannel } from "@storybook/manager-api";

const FETCH_ABORTED = "ChannelFetch/aborted";
const FETCH_REQUEST = "ChannelFetch/request";
const FETCH_RESPONSE = "ChannelFetch/response";

type SerializedResponse = {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
};

const pendingRequests = new Map<
  string,
  { resolve: (value: Response) => void; reject: (reason?: any) => void }
>();

export const useChannelFetch: () => typeof fetch = () => {
  const emit = useChannel({
    [FETCH_RESPONSE]: (
      data:
        | { requestId: string; response: SerializedResponse }
        | { requestId: string; error: string }
    ) => {
      const request = pendingRequests.get(data.requestId);
      if (!request) return;

      pendingRequests.delete(data.requestId);
      if ("error" in data) {
        request.reject(new Error(data.error));
      } else {
        const { body, headers, status, statusText } = data.response;
        const res = new Response(body, { headers, status, statusText });
        request.resolve(res);
      }
    },
  });

  return async (input: string | URL | Request, { signal, ...init }: RequestInit = {}) => {
    const requestId = Math.random().toString(36).slice(2);
    emit(FETCH_REQUEST, { requestId, input, init });

    signal?.addEventListener("abort", () => emit(FETCH_ABORTED, { requestId }));

    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
      setTimeout(() => {
        reject(new Error("Request timed out"));
        pendingRequests.delete(requestId);
      }, 30000);
    });
  };
};
