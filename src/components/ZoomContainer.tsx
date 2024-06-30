import { styled } from "@storybook/theming";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const TRANSITION_DURATION_MS = 200;

const Container = styled.div({
  margin: "auto",
  width: "max-content",
  maxWidth: "100%",
  maxHeight: "100%",
  overflow: "hidden",
  img: {
    verticalAlign: "top",
  },
});

const Content = styled.div({
  width: "max-content",
});

const initialState = {
  containerHeight: 0,
  containerWidth: 0,
  contentHeight: 0,
  contentWidth: 0,
  contentScale: 1,
  translateX: 0,
  translateY: 0,
  multiplierX: 1,
  multiplierY: 1,
  zoomed: false,
  transition: "none",
  transitionTimeout: 0,
};

type State = typeof initialState;

export const ZoomContext = createContext<[State, Dispatch<SetStateAction<State>>]>(null as any);

export const ZoomProvider = ({ children }: { children: ReactNode }) => {
  return <ZoomContext.Provider value={useState(initialState)}>{children}</ZoomContext.Provider>;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const useZoom = () => {
  const [state, setState] = useContext(ZoomContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback(() => {
    const { current: container } = containerRef;
    const { current: content } = contentRef;
    if (!container || !content) return;

    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const containerWidth = Math.min(contentWidth, container.offsetWidth);
    const containerHeight = Math.min(contentHeight, container.offsetHeight);

    const contentScale = Math.min(
      1,
      contentWidth ? containerWidth / contentWidth : 1,
      contentHeight ? containerHeight / contentHeight : 1
    );
    const translateX =
      contentWidth > containerWidth
        ? (contentWidth - containerWidth) / -2
        : (containerWidth - contentWidth * contentScale) / -2;
    const translateY =
      contentHeight > containerHeight
        ? (contentHeight - containerHeight) / -2
        : (containerHeight - contentHeight * contentScale) / -2;

    setState((currentState) => ({
      ...currentState,
      containerHeight,
      containerWidth,
      contentHeight,
      contentWidth,
      contentScale,
      translateX,
      translateY,
    }));
  }, [containerRef, contentRef, setState]);

  const onMouseEvent = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { x, y, width, height } = containerRef.current.getBoundingClientRect();

      setState((currentState) => {
        const { clientX: cx, clientY: cy, type: eventType } = e;
        const hovered = cx >= x && cx <= x + width && cy >= y && cy <= y + height;
        if (!hovered) return currentState;

        const { containerHeight, containerWidth, contentHeight, contentWidth } = currentState;
        const ratioX = contentWidth < containerWidth ? contentWidth / contentHeight + 1 : 1;
        const ratioY = contentHeight < containerHeight ? contentHeight / contentWidth + 1 : 1;
        const multiplierX = ((cx - x) / containerWidth) * 2 * 1.2 * ratioX - 0.2 * ratioX;
        const multiplierY = ((cy - y) / containerHeight) * 2 * 1.2 * ratioY - 0.2 * ratioY;

        const clicked = eventType === "click" && (e as any).pointerType !== "touch";
        const zoomed = clicked ? !currentState.zoomed : currentState.zoomed;
        const update = {
          ...currentState,
          multiplierX: zoomed ? multiplierX : 1,
          multiplierY: zoomed ? multiplierY : 1,
          zoomed,
        };
        if (!clicked) return update;

        window.clearTimeout(currentState.transitionTimeout);
        return {
          ...update,
          transition: `transform ${TRANSITION_DURATION_MS}ms`,
          transitionTimeout: window.setTimeout(
            () => setState((s) => ({ ...s, transition: "none", transitionTimeout: 0 })),
            TRANSITION_DURATION_MS
          ),
        };
      });
    },
    [containerRef, setState]
  );

  const onToggleZoom = useCallback(
    (e: React.MouseEvent) => onMouseEvent(e.nativeEvent),
    [onMouseEvent]
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMouseEvent);
    return () => window.removeEventListener("mousemove", onMouseEvent);
  }, [onMouseEvent]);

  const resizeObserver = useMemo(() => new ResizeObserver(() => updateState()), [updateState]);

  useEffect(() => {
    const { current: container } = containerRef;
    const { current: content } = contentRef;
    if (!container || !content) return () => {};

    resizeObserver.observe(container);
    resizeObserver.observe(content);

    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.unobserve(content);
    };
  }, [containerRef, contentRef, resizeObserver]);

  const translateX = clamp(
    state.multiplierX * state.translateX,
    -(state.contentWidth - state.containerWidth),
    0
  );
  const translateY = clamp(
    state.multiplierY * state.translateY,
    -(state.contentHeight - state.containerHeight),
    0
  );
  const scale = state.zoomed ? 1 : state.contentScale;
  const contentStyle = {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    transition: state.transition,
    ...(state.contentScale < 1 && { cursor: state.zoomed ? "zoom-out" : "zoom-in" }),
  };

  return {
    containerProps: {
      ref: containerRef,
    },
    contentProps: {
      ref: contentRef,
      style: contentStyle,
      onClick: onToggleZoom,
    },
    renderProps: {
      isZoomed: state.zoomed,
      toggleZoom: onToggleZoom,
    },
  };
};

export const ZoomContainer = ({
  children,
  render,
}: {
  children?: ReactNode;
  render?: (props: ReturnType<typeof useZoom>["renderProps"]) => ReactNode;
}) => {
  const { containerProps, contentProps, renderProps } = useZoom();

  return (
    <Container {...containerProps}>
      <Content {...contentProps}>{render ? render(renderProps) : children}</Content>
    </Container>
  );
};
