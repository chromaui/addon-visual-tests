import { PhotoIcon, ShareAltIcon } from "@storybook/icons";
import { styled, useTheme } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { CaptureImage, CaptureOverlayImage, ComparisonResult, Test } from "../gql/graphql";
import { Stack } from "./Stack";
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
    "img[data-overlay]": {
      position: "absolute",
      opacity: 0.7,
      pointerEvents: "none",
    },
    div: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      p: {
        maxWidth: 380,
        textAlign: "center",
      },
      svg: {
        width: 24,
        height: 24,
      },
    },
    "& > svg": {
      position: "absolute",
      left: "calc(50% - 14px)",
      top: "calc(50% - 14px)",
      width: 20,
      height: 20,
      color: theme.color.lightest,
      opacity: 0,
      transition: "opacity 0.1s ease-in-out",
      pointerEvents: "none",
    },
  }),
  ({ href }) =>
    href && {
      display: "inline-flex",
      cursor: "pointer",
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

const StyledStack = styled(Stack)(({ theme }) => ({
  margin: "30px 15px",
}));

interface SnapshotImageProps {
  componentName?: NonNullable<NonNullable<Test["story"]>["component"]>["name"];
  storyName?: NonNullable<Test["story"]>["name"];
  testUrl: Test["webUrl"];
  comparisonResult?: ComparisonResult;
  latestImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  baselineImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  baselineImageVisible?: boolean;
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
  latestImage,
  baselineImage,
  baselineImageVisible,
  diffImage,
  focusImage,
  diffVisible,
  focusVisible,
  ...props
}: SnapshotImageProps & ComponentProps<typeof Container>) => {
  const theme = useTheme();
  const hasDiff = !!latestImage && !!diffImage && comparisonResult === ComparisonResult.Changed;
  const hasError = comparisonResult === ComparisonResult.CaptureError;
  const hasFocus = hasDiff && !!focusImage;
  const containerProps = hasDiff
    ? { as: "a" as any, href: testUrl, target: "_blank", title: "View on Chromatic.com" }
    : {};
  const showDiff = hasDiff && diffVisible;
  const showFocus = hasFocus && focusVisible;

  return (
    <Container {...props} {...containerProps}>
      {latestImage && (
        <img
          alt={`Latest snapshot for the '${storyName}' story of the '${componentName}' component`}
          src={latestImage.imageUrl}
          style={{
            display: baselineImageVisible ? "none" : "block",
          }}
        />
      )}
      {baselineImage && (
        <img
          alt={`Baseline snapshot for the '${storyName}' story of the '${componentName}' component`}
          src={baselineImage.imageUrl}
          style={{
            display: baselineImageVisible ? "block" : "none",
          }}
        />
      )}
      {hasDiff && (
        <img
          alt=""
          data-overlay="diff"
          src={diffImage.imageUrl}
          style={{
            maxWidth: `${(diffImage.imageWidth / latestImage.imageWidth) * 100}%`,
            opacity: showDiff ? 0.7 : 0,
          }}
        />
      )}
      {hasFocus && (
        <img
          alt=""
          data-overlay="focus"
          src={focusImage.imageUrl}
          style={{
            maxWidth: `${(focusImage.imageWidth / latestImage.imageWidth) * 100}%`,
            opacity: showFocus ? 0.7 : 0,
            filter: showFocus ? "blur(2px)" : "none",
          }}
        />
      )}
      {hasDiff && <ShareAltIcon />}
      {hasError && !latestImage && (
        <StyledStack>
          <PhotoIcon color={theme.base === "light" ? "currentColor" : theme.color.medium} />
          <Text center muted>
            A snapshot couldn’t be captured. This often occurs when a story has a code error.
            Confirm that this story successfully renders in your local Storybook and run the build
            again.
          </Text>
        </StyledStack>
      )}
    </Container>
  );
};
