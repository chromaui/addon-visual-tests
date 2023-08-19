import { Icons } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { CaptureImage, CaptureOverlayImage, ComparisonResult } from "../gql/graphql";

export const Container = styled.div<{ href?: string; target?: string }>(
  ({ theme }) => ({
    position: "relative",
    display: "inline-flex",
    background: "transparent",
    margin: 2,
    overflow: "hidden",

    img: {
      maxWidth: "100%",
      transition: "filter 0.1s ease-in-out",
      objectFit: "contain",
      objectPosition: "0 0",
    },
    "img + img": {
      position: "absolute",
      opacity: 0.7,
      pointerEvents: "none",
    },
    div: {
      color: theme.color.mediumdark,
      margin: "30px 15px",
      textAlign: "center",
      svg: {
        width: 28,
        height: 28,
      },
    },
    "& > svg": {
      position: "absolute",
      width: 28,
      height: 28,
      color: theme.color.lightest,
      opacity: 0,
      transition: "opacity 0.1s ease-in-out",
      pointerEvents: "none",
    },
  }),
  ({ href }) =>
    href && {
      "&:hover": {
        "& > svg": {
          opacity: 1,
        },
        img: {
          filter: "brightness(85%)",
        },
      },
    }
);

interface SnapshotImageProps {
  comparisonResult: ComparisonResult;
  captureImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  diffImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  focusImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  diffVisible: boolean;
  focusVisible: boolean;
}

export const SnapshotImage = ({
  comparisonResult,
  captureImage,
  diffImage,
  focusImage,
  diffVisible,
  focusVisible,
  ...props
}: SnapshotImageProps & ComponentProps<typeof Container>) => {
  return (
    <Container {...props}>
      {captureImage && <img src={captureImage.imageUrl} alt="" />}
      {diffImage && diffVisible && comparisonResult === ComparisonResult.Changed && (
        <img
          src={diffImage.imageUrl}
          alt=""
          style={{
            maxWidth: `${(diffImage.imageWidth / captureImage.imageWidth) * 100}%`,
          }}
        />
      )}
      {focusImage && focusVisible && comparisonResult === ComparisonResult.Changed && (
        <img
          src={focusImage.imageUrl}
          alt=""
          style={{
            maxWidth: `${(focusImage.imageWidth / captureImage.imageWidth) * 100}%`,
          }}
        />
      )}
      {!captureImage && comparisonResult === ComparisonResult.CaptureError && (
        <div>
          <Icons icon="photo" />
          <p>
            A snapshot couldn’t be captured. This often occurs when a story has a code error.
            Confirm that this story successfully renders in your local Storybook and run the build
            again.
          </p>
        </div>
      )}
      <Icons icon="sharealt" />
    </Container>
  );
};
