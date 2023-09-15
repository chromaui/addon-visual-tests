import { useCallback, useEffect, useRef } from "react";

export type DialogEventName = "login";
export type DialogPayload<T extends DialogEventName> = Record<string, never>;
export type DialogHandlers = {
  [Event in DialogEventName]?: (payload: DialogPayload<Event>) => void;
};

export const useChromaticDialog = (handlers: DialogHandlers = {}) => {
  const dialog = useRef<Window>();
  const dialogOrigin = useRef<string>();

  // Close the dialog window when the screen gets unmounted.
  useEffect(() => () => dialog.current?.close(), []);

  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent) => {
      if (origin === dialogOrigin.current) {
        const { message, ...rest } = data;
        if (message in handlers) {
          handlers[message as DialogEventName](rest);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [handlers]);

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
