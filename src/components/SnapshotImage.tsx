import { Icons } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps, RefObject, useRef } from "react";

import { CaptureImage, CaptureOverlayImage, ComparisonResult, Test } from "../gql/graphql";
import { Text } from "./Text";

export const Container = styled.div<{ isZoomed?: boolean }>(({ isZoomed, theme }) => ({
  position: "relative",
  display: "flex",
  width: "max-content",
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
    zIndex: 2,
  },
  "img[data-overlay='diff']": {
    mixBlendMode: "multiply",
  },
  "span[data-divider]": {
    position: "absolute",
    height: "100%",
    width: 2,
    zIndex: 3,
    background: theme.background.content,
    boxShadow: `0 0 20px ${theme.color.defaultText}99`,
    pointerEvents: "none",
    "&::before, &::after": {
      position: "absolute",
      top: 2,
      opacity: isZoomed ? 1 : 0,
      padding: "1px 3px",
      background: theme.background.content,
      borderRadius: 2,
      // boxShadow: `0 0 20px ${theme.color.defaultText}33`,
      color: theme.color.defaultText,
      fontSize: 9,
      fontSmooth: "always",
      letterSpacing: 1,
      textTransform: "uppercase",
      transition: "opacity 0.2s",
    },
    "&::before": {
      content: '"baseline"',
      right: 4,
    },
    "&::after": {
      content: '"latest"',
      left: 4,
    },
  },
  "div['data-error']": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    margin: "30px 15px",
    color: theme.color.mediumdark,
    zIndex: 1,
    p: {
      maxWidth: 380,
      textAlign: "center",
    },
    svg: {
      width: 28,
      height: 28,
    },
  },
}));

interface SnapshotImageProps {
  componentName?: NonNullable<NonNullable<Test["story"]>["component"]>["name"];
  storyName?: NonNullable<Test["story"]>["name"];
  comparisonResult?: ComparisonResult;
  latestImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  baselineImage?: Pick<CaptureImage, "imageUrl" | "imageWidth">;
  baselineImageVisible?: boolean;
  diffImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  focusImage?: Pick<CaptureOverlayImage, "imageUrl" | "imageWidth">;
  diffVisible: boolean;
  focusVisible: boolean;
}

const useDividerPosition = (targetRef: RefObject<HTMLElement>) => {
  const [dividerPosition, setDividerPosition] = React.useState<number | null>(null);

  React.useEffect(() => {
    const onMouseMove = ({ clientX: cx, clientY: cy }: MouseEvent) => {
      if (!targetRef?.current) return;
      const { x, y, width, height } = targetRef.current.getBoundingClientRect();
      const hovering = cx >= x && cx <= x + width && cy >= y && cy <= y + height;
      setDividerPosition(hovering ? ((cx - x) / width) * 100 : null);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [targetRef]);

  return dividerPosition;
};

export const SnapshotImage = ({
  componentName,
  storyName,
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
  const hasDiff = !!latestImage && !!diffImage && comparisonResult === ComparisonResult.Changed;
  const hasError = comparisonResult === ComparisonResult.CaptureError;
  const hasFocus = hasDiff && !!focusImage;
  const showDiff = hasDiff && diffVisible;
  const showFocus = hasFocus && focusVisible;

  const imageRef = useRef<HTMLImageElement>(null);
  const dividerPosition = useDividerPosition(imageRef);
  const showDivider = !!latestImage && !!baselineImage && !!dividerPosition;

  return (
    <Container {...props}>
      {latestImage && (
        <img
          ref={imageRef}
          data-snapshot="latest"
          alt={`Latest snapshot for the '${storyName}' story of the '${componentName}' component`}
          src={latestImage.imageUrl}
          style={{
            filter: showDiff && !showFocus ? `brightness(105%)` : "none",
            zIndex: baselineImageVisible ? 0 : 1,
            clipPath: showDivider ? `inset(0 0 0 ${dividerPosition}%)` : "none",
            cursor: showDivider ? "ew-resize" : "auto",
          }}
        />
      )}
      {baselineImage && (
        <img
          data-snapshot="baseline"
          alt={`Baseline snapshot for the '${storyName}' story of the '${componentName}' component`}
          src={baselineImage.imageUrl}
          style={{
            position: latestImage ? "absolute" : "relative",
            filter: showDiff && !showFocus ? `brightness(105%)` : "none",
            zIndex: baselineImageVisible ? 1 : 0,
            clipPath:
              showDivider && baselineImageVisible
                ? `inset(0 ${100 - dividerPosition}% 0 0)`
                : "none",
            cursor: showDivider ? "ew-resize" : "auto",
            maxWidth: latestImage
              ? `${(baselineImage.imageWidth / latestImage.imageWidth) * 100}%`
              : "100%",
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
            opacity: showDiff ? 1 : 0,
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
            opacity: showFocus ? 1 : 0,
          }}
        />
      )}
      {showDivider && <span data-divider style={{ left: `${dividerPosition}%` }} />}
      {hasError && !latestImage && (
        <div data-error>
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
