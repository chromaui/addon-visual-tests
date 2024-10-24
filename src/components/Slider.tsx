import { styled } from "@storybook/theming";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";

export const Container = styled.div<{ isZoomed?: boolean }>(({ isZoomed, theme }) => ({
  position: "relative",
  display: "inline-flex",
  width: "max-content",
  maxWidth: "100%",
  background: "transparent",
  overflow: "hidden",
}));

const Divider = styled.div(({ theme }) => ({
  position: "absolute",
  height: "100%",
  width: 1,
  zIndex: 3,
  background: theme.color.secondary,

  pointerEvents: "none",
  "&::before, &::after": {
    position: "absolute",
    bottom: 10,
    padding: "1px 3px",
    background: theme.color.secondary,
    borderRadius: 2,
    color: theme.color.lightest,
    fontSize: 10,
    fontSmooth: "always",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  "&::before": {
    content: `'Baseline'`,
    right: 4,
  },
  "&::after": {
    content: `'Latest'`,
    left: 4,
  },
}));

type State = number;

export const SliderContext = createContext<[State, Dispatch<SetStateAction<State>>]>(null as any);

export const SliderProvider = ({ children }: { children: ReactNode }) => (
  <SliderContext.Provider value={useState<State>(50)}>{children}</SliderContext.Provider>
);

const useDividerPosition = (targetRef: RefObject<HTMLElement>) => {
  const [dividerPosition, setDividerPosition] = useContext(SliderContext);

  React.useEffect(() => {
    const onMouseMove = ({ clientX: cx, clientY: cy }: MouseEvent) => {
      if (!targetRef?.current) return;
      const { x, y, width, height } = targetRef.current.getBoundingClientRect();
      const hovering = cx >= x && cx <= x + width && cy >= y && cy <= y + height;
      if (hovering) setDividerPosition(((cx - x) / width) * 100);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [targetRef, setDividerPosition]);

  return dividerPosition;
};

type SliderProps = {
  baseline: ReactNode;
  latest: ReactNode;
  visible?: boolean;
};

export const Slider = ({ baseline, latest, visible = true }: SliderProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const dividerPosition = useDividerPosition(imageRef);

  const baselineImageVisible = false;
  const showDivider = !!baseline && !!latest && !!dividerPosition && visible;

  return (
    <Container ref={imageRef}>
      {baseline && (
        <div
          style={{
            position: latest ? "absolute" : "relative",
            zIndex: baselineImageVisible ? 1 : 0,
            clipPath:
              showDivider && baselineImageVisible
                ? `inset(0 ${100 - dividerPosition}% 0 0)`
                : "none",
            cursor: showDivider ? "ew-resize" : "auto",
            maxWidth: "100%",
            // maxWidth: latest
            //   ? `${(baselineImage.imageWidth / latestImage.imageWidth) * 100}%`
            //   : "100%",
          }}
        >
          {baseline}
        </div>
      )}
      {latest && (
        <div
          style={{
            zIndex: baselineImageVisible ? 0 : 1,
            clipPath: showDivider ? `inset(0 0 0 ${dividerPosition}%)` : "none",
            cursor: showDivider ? "ew-resize" : "auto",
            maxWidth: "100%",
          }}
        >
          {latest}
        </div>
      )}
      {showDivider && <Divider style={{ left: `${dividerPosition}%` }} />}
    </Container>
  );
};
