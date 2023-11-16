import { Icons } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { CaptureImage, CaptureOverlayImage, ComparisonResult, Test } from "../gql/graphql";
import { Text } from "./Text";

export const Container = styled.div<{ href?: string; target?: string }>(
  ({ theme }) => ({
    position: "relative",
    display: "flex",
    background: "transparent",
    overflow: "hidden",
    margin: 2,

    img: {
      maxWidth: "100%",
      transition: "filter 0.1s ease-in-out",
    },
    "img + img": {
      position: "absolute",
      opacity: 0.7,
      pointerEvents: "none",
    },
    div: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      margin: "30px 15px",
      color: theme.color.mediumdark,
      p: {
        maxWidth: 380,
        textAlign: "center",
      },
      svg: {
        width: 28,
        height: 28,
      },
    },
    "& > svg": {
      position: "absolute",
      left: "calc(50% - 14px)",
      top: "calc(50% - 14px)",
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
      display: "inline-flex",
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
  componentName?: NonNullable<NonNullable<Test["story"]>["component"]>["name"];
  storyName?: NonNullable<Test["story"]>["name"];
  testUrl: Test["webUrl"];
  comparisonResult?: ComparisonResult;
  captureImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  diffImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  focusImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  diffVisible: boolean;
  focusVisible: boolean;
}

export const SnapshotImage = ({
  componentName,
  storyName,
  testUrl,
  comparisonResult,
  captureImage,
  diffImage,
  focusImage,
  diffVisible,
  focusVisible,
  ...props
}: SnapshotImageProps & ComponentProps<typeof Container>) => {
  const hasDiff = captureImage && diffImage && comparisonResult === ComparisonResult.Changed;
  const hasError = comparisonResult === ComparisonResult.CaptureError;
  const containerProps = hasDiff ? { as: "a" as any, href: testUrl, target: "_blank" } : {};
  const showDiff = hasDiff && diffVisible;
  const showFocus = hasDiff && focusImage && focusVisible;

  return (
    <Container {...props} {...containerProps}>
      {captureImage && (
        <img
          alt={`Snapshot for the '${storyName}' story of the '${componentName}' component`}
          key={captureImage.imageUrl}
          src={captureImage.imageUrl}
          style={{ opacity: showDiff && !showFocus ? 0.7 : 1 }}
        />
      )}
      {showDiff && (
        <img
          alt=""
          src={diffImage.imageUrl}
          style={{ maxWidth: `${(diffImage.imageWidth / captureImage.imageWidth) * 100}%` }}
        />
      )}
      {showFocus && (
        <img
          alt=""
          src={focusImage.imageUrl}
          style={{ maxWidth: `${(focusImage.imageWidth / captureImage.imageWidth) * 100}%` }}
        />
      )}
      {hasDiff && <Icons icon="sharealt" />}
      {hasError && !captureImage && (
        <div>
          <Icons icon="photo" />
          <Text>
            A snapshot couldn’t be captured. This often occurs when a story has a code error.
            Confirm that this story successfully renders in your local Storybook and run the build
            again.
          </Text>
        </div>
      )}
    </Container>
  );
};
