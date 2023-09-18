import { useCallback, useEffect, useRef } from "react";

export const useChromaticDialog = () => {
  const dialog = useRef<Window | null>();

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
    }, []),
    useCallback(() => dialog.current?.close(), []),
  ] as const;
};
