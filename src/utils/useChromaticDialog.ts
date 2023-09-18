import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";

const dialogPayloadSchema = z.union([
  z.object({ message: z.literal("login") }),
  z.object({ message: z.literal("grant"), denied: z.boolean() }),
  z.object({ message: z.literal("projectCreated"), projectId: z.string() }),
]);

type Schema = z.infer<typeof dialogPayloadSchema>;

// This semi-magical code is to preserve the union as we map from Schema->Pairs[keyof Pairs]
// Got the technique from https://stackoverflow.com/a/75805274
type Pairs<K extends Schema["message"] = Schema["message"]> = {
  [TMessage in K]: [TMessage, Omit<Extract<Schema, { message: TMessage }>, "message">];
};

function mapToPairs<K extends Schema["message"]>(
  parsed: Extract<Schema, { message: K }>
): Pairs<K>[K] {
  return [parsed.message, parsed];
}

export type DialogHandler = (...args: Pairs[keyof Pairs]) => void;

export const useChromaticDialog = (handler?: DialogHandler) => {
  const dialog = useRef<Window | null>();
  const dialogOrigin = useRef<string>();

  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent) => {
      if (origin === dialogOrigin.current) {
        const parsed = dialogPayloadSchema.parse(data);

        handler?.(...mapToPairs(parsed));
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [handler]);

  return [
    useCallback((url: string) => {
      const width = 800;
      const height = 800;
      const usePopup = window.innerWidth > width && window.innerHeight > height;

      if (usePopup) {
        const left = (window.innerWidth - width) / 2 + window.screenLeft;
        const top = (window.innerHeight - height) / 2 + window.screenTop;
        const options = `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`;
        dialog.current = window.open(url, "oauth-dialog", options);
        dialog.current?.focus();
      } else {
        dialog.current = window.open(url, "_blank");
      }
      const { origin } = new URL(url);
      dialogOrigin.current = origin;
    }, []),

    useCallback(() => dialog.current?.close(), []),
  ] as const;
};
