export type ShareState =
  | { status: 'welcome' }
  | { status: 'idle' }
  | {
      status: 'verifying';
      userCode: string;
      verificationUrl: string;
      deviceCode: string;
      verifier: string;
      expires: number;
      interval: number;
    }
  | { status: 'uploading'; shareUrl: string }
  | { status: 'complete'; shareUrl: string; publishedAt: number }
  | { status: 'error'; reason: 'cancelled' | 'expired' | 'unknown' };
