import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";

const dialogPayloadSchema = z.union([
  z.object({ message: z.literal("login") }),
  z.object({ message: z.literal("grant"), denied: z.boolean() }),
  z.object({ message: z.literal("projectCreated"), projectId: z.string() }),
]);

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type Schema = WithRequired<z.infer<typeof dialogPayloadSchema>, "message">;
type Payload<T extends { message: string }, TMessage extends string> = Omit<
  Extract<T, { message: TMessage }>,
  "message"
>;

type DialogArguments =
  | ["login", Payload<Schema, "login">]
  | ["grant", Payload<Schema, "grant">]
  | ["projectCreated", Payload<Schema, "projectCreated">];

export type DialogHandler = (...args: DialogArguments) => void;

export const useChromaticDialog = (handler?: DialogHandler) => {
  const dialog = useRef<Window>();
  const dialogOrigin = useRef<string>();

  // Close the dialog window when the screen gets unmounted.
  useEffect(() => () => dialog.current?.close(), []);

  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent) => {
      if (origin === dialogOrigin.current) {
        const { message, ...payload } = dialogPayloadSchema.parse(data);

        handler?.(message, payload);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [handler]);

  return useCallback(
    (url: string) => {
      const width = 800;
      const height = 800;
      const usePopup = window.innerWidth > width && window.innerHeight > height;

      if (usePopup) {
        const left = (window.innerWidth - width) / 2 + window.screenLeft;
        const top = (window.innerHeight - height) / 2 + window.screenTop;
        const options = `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`;
        dialog.current = window.open(url, "chromatic-dialog", options);
        if (window.focus) dialog.current.focus();
      } else {
        dialog.current = window.open(url, "_blank");
      }
      const { origin } = new URL(url);
      dialogOrigin.current = origin;
    },
    [dialog, dialogOrigin]
  );
};
