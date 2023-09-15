import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";

const dialogEventNames = ["login", "bar"] as const;
export type DialogEventName = (typeof dialogEventNames)[number];
const isDialogEventName = (name: string): name is DialogEventName =>
  dialogEventNames.includes(name as DialogEventName);

const dialogPayloadSchemas = {
  login: z.object({ foo: z.number() }),

  bar: z.object({ foo: z.string() }),
} as const;

export type DialogPayload<T extends DialogEventName> = z.infer<(typeof dialogPayloadSchemas)[T]>;

export type DialogHandler = (
  eventName: DialogEventName,
  payload: DialogPayload<typeof eventName>
) => void;

export const useChromaticDialog = (handler?: DialogHandler) => {
  const dialog = useRef<Window>();
  const dialogOrigin = useRef<string>();

  // Close the dialog window when the screen gets unmounted.
  useEffect(() => () => dialog.current?.close(), []);

  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent) => {
      if (origin === dialogOrigin.current) {
        const { message: eventName, ...rest } = data;
        if (!isDialogEventName(eventName)) {
          throw new Error(`Unexpected event from dialog: ${eventName}`);
        }

        const payload = dialogPayloadSchemas[eventName].parse(rest);
        handler?.(eventName, payload);
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
