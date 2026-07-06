const platformDPIMap = {
  android: 420,
  ios: 460,
} as const;

export const getCapturedPixelRatio = ({
  isReactNative,
  browser,
  browsers,
  deviceScaleFactor = 1,
}: {
  isReactNative?: boolean;
  browser?: string;
  browsers: readonly string[];
  deviceScaleFactor?: number;
}) => {
  const capturedPixelRatio =
    isReactNative && browser && browsers.includes(browser)
      ? platformDPIMap[browser as keyof typeof platformDPIMap] / 160
      : deviceScaleFactor;
  return capturedPixelRatio;
};

export const getDisplayImageSize = ({
  captureImageSize,
  capturedPixelRatio,
}: {
  captureImageSize?: { width: number; height: number };
  capturedPixelRatio: number;
}): { width: number; height: number } | undefined => {
  if (!captureImageSize || capturedPixelRatio <= 1) {
    return captureImageSize;
  }
  return {
    width: Math.round(captureImageSize.width / capturedPixelRatio),
    height: Math.round(captureImageSize.height / capturedPixelRatio),
  };
};
