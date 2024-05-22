import { PhotoIcon, ShareAltIcon } from "@storybook/icons";
import { keyframes, styled, useTheme } from "@storybook/theming";
import React, { ComponentProps } from "react";

import { CaptureImage, CaptureOverlayImage, ComparisonResult, Test } from "../gql/graphql";
import { Stack } from "./Stack";
import { Text } from "./Text";

const indeterminateProgressBar = keyframes({
  "0%": {
    transform: "translateX(0) scaleX(0)",
  },
  "40%": {
    transform: "translateX(0) scaleX(0.4)",
  },
  "100%": {
    transform: "translateX(100%) scaleX(0.5)",
  },
});

export const Container = styled.div<{ loading?: boolean; href?: string; target?: string }>(
  ({ loading, theme }) => ({
    position: "relative",
    display: "flex",
    background: "transparent",
    overflow: "hidden",
    margin: 2,
    maxWidth: "calc(100% - 4px)",
    verticalAlign: "top",

    "&::before": {
      content: "''",
      display: "block",
      position: "absolute",
      top: 0,
      left: 0,
      height: 3,
      width: "100%",
      opacity: loading ? 1 : 0,
      transform: "translateX(0) scaleX(0)",
      background: theme.color.secondary,
      animation: `1.5s linear 1s infinite ${indeterminateProgressBar}`,
      transformOrigin: "0% 50%",
      transition: "opacity 0.1s",
      zIndex: 1,
    },

    "& > div": {
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

const ImageWrapper = styled.div<{ isVisible?: boolean }>(({ isVisible }) => ({
  position: isVisible ? "static" : "absolute",
  visibility: isVisible ? "visible" : "hidden",
  maxWidth: "100%",
  minHeight: 100,
}));

const Image = styled.img({
  display: "block",
  width: "100%",
  height: "auto",
  transition: "filter 0.1s ease-in-out",

  "&[data-overlay]": {
    position: "absolute",
    opacity: 0.7,
    pointerEvents: "none",
  },
});

const StyledStack = styled(Stack)({
  margin: "30px 15px",
});

const getOverlayImageLoaded = ({
  comparisonImageLoaded,
  focusImageLoaded,
  showDiff,
  showFocus,
}: {
  comparisonImageLoaded: boolean;
  focusImageLoaded: boolean;
  showDiff: boolean;
  showFocus: boolean;
}) => {
  if (showDiff && showFocus) return comparisonImageLoaded && focusImageLoaded;
  if (showDiff) return comparisonImageLoaded;
  if (showFocus) return focusImageLoaded;
  return true;
};

interface SnapshotImageProps {
  componentName?: NonNullable<NonNullable<Test["story"]>["component"]>["name"];
  storyName?: NonNullable<Test["story"]>["name"];
  testUrl: Test["webUrl"];
  comparisonResult?: ComparisonResult;
  latestImage?: Pick<CaptureImage, "imageUrl" | "imageWidth" | "imageHeight">;
  baselineImage?: Pick<CaptureImage, "imageUrl" | "imageWidth" | "imageHeight">;
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

  const [latestImageLoaded, setLatestImageLoaded] = React.useState(false);
  const [baselineImageLoaded, setBaselineImageLoaded] = React.useState(false);
  const [comparisonImageLoaded, setComparisonImageLoaded] = React.useState(false);
  const [focusImageLoaded, setFocusImageLoaded] = React.useState(false);
  const snapshotImageLoaded = baselineImageVisible ? baselineImageLoaded : latestImageLoaded;
  const overlayImageLoaded = getOverlayImageLoaded({
    comparisonImageLoaded,
    focusImageLoaded,
    showDiff,
    showFocus,
  });
  const loading = !latestImageLoaded || !overlayImageLoaded;

  return (
    <Container {...props} {...containerProps} loading={loading && !hasError}>
      {latestImage && (
        <ImageWrapper
          isVisible={!baselineImage || !baselineImageVisible}
          style={{
            aspectRatio: `${latestImage.imageWidth} / ${latestImage.imageHeight}`,
            width: latestImage.imageWidth,
          }}
        >
          <Image
            alt={`Latest snapshot for the '${storyName}' story of the '${componentName}' component`}
            src={latestImage.imageUrl}
            style={{ opacity: latestImageLoaded ? 1 : 0 }}
            onLoad={() => setLatestImageLoaded(true)}
          />
        </ImageWrapper>
      )}
      {baselineImage && (
        <ImageWrapper
          isVisible={baselineImageVisible}
          style={{
            aspectRatio: `${baselineImage.imageWidth} / ${baselineImage.imageHeight}`,
            width: baselineImage.imageWidth,
          }}
        >
          <Image
            alt={`Baseline snapshot for the '${storyName}' story of the '${componentName}' component`}
            src={baselineImage.imageUrl}
            style={{ opacity: baselineImageLoaded ? 1 : 0 }}
            onLoad={() => setBaselineImageLoaded(true)}
          />
        </ImageWrapper>
      )}
      {hasDiff && snapshotImageLoaded && (
        <Image
          alt=""
          data-overlay="diff"
          src={diffImage.imageUrl}
          style={{
            width: diffImage.imageWidth,
            maxWidth: `${(diffImage.imageWidth / latestImage.imageWidth) * 100}%`,
            opacity: showDiff && comparisonImageLoaded ? 0.7 : 0,
          }}
          onLoad={() => setComparisonImageLoaded(true)}
        />
      )}
      {hasFocus && snapshotImageLoaded && (
        <Image
          alt=""
          data-overlay="focus"
          src={focusImage.imageUrl}
          style={{
            width: focusImage.imageWidth,
            maxWidth: `${(focusImage.imageWidth / latestImage.imageWidth) * 100}%`,
            opacity: showFocus && focusImageLoaded ? 0.7 : 0,
            filter: showFocus ? "blur(2px)" : "none",
          }}
          onLoad={() => setFocusImageLoaded(true)}
        />
      )}
      {hasDiff && <ShareAltIcon />}
      {hasError && !latestImage && (
        <StyledStack>
          <PhotoIcon color={theme.base === "light" ? "currentColor" : theme.color.medium} />
          <Text center muted>
            A snapshot couldn&apos;t be captured. This often occurs when a story has a code error.
            Confirm that this story successfully renders in your local Storybook and run the build
            again.
          </Text>
        </StyledStack>
      )}
    </Container>
  );
};
