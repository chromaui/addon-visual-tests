import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

const dialogPayloadSchema = z.union([
  z.object({ message: z.literal('login') }),
  z.object({ message: z.literal('grant'), denied: z.boolean() }),
  z.object({ message: z.literal('createdProject'), projectId: z.string() }),
]);

type Schema = z.infer<typeof dialogPayloadSchema>;

export type DialogHandler = (payload: Schema) => void;

export const useChromaticDialog = (handler?: DialogHandler) => {
  const dialog = useRef<Window | null>();
  const dialogOrigin = useRef<string>();

  useEffect(() => {
    const handleMessage = ({ origin, data }: MessageEvent) => {
      if (origin === dialogOrigin.current) {
        let parsed: Schema;
        try {
          parsed = dialogPayloadSchema.parse(data);
        } catch (_) {
          // Don't log anything on parsing errors, as we can get messages from things like intercom
          return;
        }
        handler?.(parsed);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
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
        dialog.current = window.open(url, 'chromatic-dialog', options);
        dialog.current?.focus();
      } else {
        dialog.current = window.open(url, '_blank');
      }
      const { origin } = new URL(url);
      dialogOrigin.current = origin;
    }, []),

    useCallback(() => dialog.current?.close(), []),
  ] as const;
};
