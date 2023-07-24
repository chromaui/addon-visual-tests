import type { Browser } from "../gql/graphql";

export const browser = (key: Browser) => ({
  id: key,
  key,
  name: key.slice(0, 1) + key.slice(1).toLowerCase(),
  version: "<unknown>",
});

export const viewport = (width: number) => ({
  id: `_${width}`,
  name: `${width}px`,
  width,
  isDefault: width === 1200,
});

export const headCapture = {
  captureImage: {
    imageUrl: "/B.png",
  },
};

export const captureDiff = {
  diffImage: {
    imageUrl: "/B-comparison.png",
  },
};
