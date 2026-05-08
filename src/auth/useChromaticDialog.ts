import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

// The dialog hook keeps the OAuth grant/login shapes (used directly by
// useOAuthFlow's grant handler) and accepts any other Chromatic addon
// message via a permissive catch-all. Domain-specific shapes such as the
// Verify screen's createdProject relay are validated by their consumers
// inside the onMessage hook so this transport stays decoupled from
// product flows.
const dialogPayloadSchema = z.union([
  z.object({ message: z.literal('login') }),
  z.object({
    message: z.literal('grant'),
    code: z.string(),
    state: z.string(),
  }),
  z.object({
    message: z.literal('grant'),
    error: z.string(),
    error_description: z.string().optional(),
    state: z.string().optional(),
  }),
  z.object({ message: z.string() }).passthrough(),
]);

type Schema = z.infer<typeof dialogPayloadSchema>;

export type DialogHandler = (payload: Schema) => void;

export const useChromaticDialog = (handler?: DialogHandler) => {
  const dialog = useRef<Window | null>();
  const allowedOrigins = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleMessage = ({ origin, data, source }: MessageEvent) => {
      if (!allowedOrigins.current.has(origin)) {
        return;
      }
      if (source !== dialog.current) {
        return;
      }

      let parsed: Schema;
      try {
        parsed = dialogPayloadSchema.parse(data);
      } catch (_) {
        // Don't log anything on parsing errors, as we can get messages from things like intercom
        return;
      }
      handler?.(parsed);
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [handler]);

  return [
    useCallback((url: string, additionalOrigins: string[] = []): boolean => {
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
      if (!dialog.current) {
        // Popup blocked or unavailable. Reset allowed origins so a stale
        // listener never accepts messages tied to a previous attempt.
        allowedOrigins.current = new Set();
        return false;
      }
      const { origin } = new URL(url);
      allowedOrigins.current = new Set([origin, ...additionalOrigins]);
      return true;
    }, []),

    useCallback(() => {
      dialog.current?.close();
      dialog.current = null;
      allowedOrigins.current = new Set();
    }, []),
  ] as const;
};
