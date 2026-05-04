export type ShareState =
  | { status: 'welcome' }
  | { status: 'idle' }
  | { status: 'uploading'; shareUrl: string }
  | { status: 'complete'; shareUrl: string; publishedAt: number }
  | {
      status: 'error';
      reason: 'cancelled' | 'expired' | 'unknown' | 'auth';
      message?: string;
    };
