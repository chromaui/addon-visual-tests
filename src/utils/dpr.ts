export const getDisplayImageSize = ({
  captureImageSize,
  deviceScaleFactor = 1,
}: {
  captureImageSize?: { width: number; height: number };
  deviceScaleFactor?: number;
}): { width: number; height: number } | undefined => {
  if (!captureImageSize || deviceScaleFactor <= 1) {
    return captureImageSize;
  }
  return {
    width: Math.round(captureImageSize.width / deviceScaleFactor),
    height: Math.round(captureImageSize.height / deviceScaleFactor),
  };
};
