import { Icons } from "@storybook/components";
import { styled } from "@storybook/theming";
import React, { ComponentProps, RefObject, useRef } from "react";

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
    "img[data-snapshot='latest']": {
      zIndex: 1,
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
      width: 3,
      height: "100%",
      background: theme.color.defaultText,
      border: `1px solid ${theme.background.app}`,
      opacity: 0.7,
      zIndex: 2,
      pointerEvents: "none",
    },
    div: {
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
    "& > svg": {
      position: "absolute",
      left: "calc(50% - 14px)",
      top: "calc(50% - 14px)",
      zIndex: 1,
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
    const updateMousePosition = ({ clientX: cx, clientY: cy }: MouseEvent) => {
      if (!targetRef?.current) return;
      const { x, y, width, height } = targetRef.current.getBoundingClientRect();
      const hovering = cx >= x && cx <= x + width && cy >= y && cy <= y + height;
      setDividerPosition(hovering ? cx - x : null);
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [targetRef]);

  return dividerPosition;
};

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
  const hasDiff = !!latestImage && !!diffImage && comparisonResult === ComparisonResult.Changed;
  const hasError = comparisonResult === ComparisonResult.CaptureError;
  const hasFocus = hasDiff && !!focusImage;
  const containerProps = hasDiff ? { as: "a" as any, href: testUrl, target: "_blank" } : {};
  const showDiff = hasDiff && diffVisible;
  const showFocus = hasFocus && focusVisible;

  const imageRef = useRef<HTMLImageElement>(null);
  const dividerPosition = useDividerPosition(imageRef);
  const showDivider = !showDiff && !showFocus && !!dividerPosition;

  return (
    <Container {...props} {...containerProps}>
      {latestImage && (
        <img
          ref={imageRef}
          data-snapshot="latest"
          alt={`Latest snapshot for the '${storyName}' story of the '${componentName}' component`}
          src={latestImage.imageUrl}
          style={{
            filter: showDiff && !showFocus ? `brightness(105%)` : "none",
            display: baselineImageVisible ? "none" : "block",
            clipPath: showDivider ? `inset(0 0 0 ${dividerPosition}px)` : "none",
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
            filter: showDiff && !showFocus ? `brightness(105%)` : "none",
            position: baselineImageVisible ? "initial" : "absolute",
            cursor: showDivider ? "ew-resize" : "auto",
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
      {showDivider && <span data-divider style={{ left: dividerPosition - 1 }} />}
      {hasDiff && <Icons icon="sharealt" />}
      {hasError && !latestImage && (
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
