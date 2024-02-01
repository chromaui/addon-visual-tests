import { styled } from "@storybook/theming";
import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { createPortal } from "react-dom";

interface ConfettiProps extends Omit<React.ComponentProps<typeof ReactConfetti>, "drawShape"> {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  numberOfPieces?: number;
  recycle?: boolean;
  colors?: string[];
}

const Wrapper = styled.div<{
  width: number;
  height: number;
  top: number;
  left: number;
}>(({ width, height, left, top }) => ({
  width: `${width}px`,
  height: `${height}px`,
  left: `${left}px`,
  top: `${top}px`,
  position: "relative",
  overflow: "hidden",
}));

export function Confetti({
  top = 0,
  left = 0,
  width = window.innerWidth,
  height = window.innerHeight,
  colors = ["#CA90FF", "#FC521F", "#66BF3C", "#FF4785", "#FFAE00", "#1EA7FD"],
  ...confettiProps
}: ConfettiProps): React.ReactPortal {
  const [confettiContainer] = useState(() => {
    const container = document.createElement("div");
    container.setAttribute("id", "confetti-container");
    container.setAttribute(
      "style",
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999;"
    );

    return container;
  });

  useEffect(() => {
    document.body.appendChild(confettiContainer);

    return () => {
      document.body.removeChild(confettiContainer);
    };
  }, [confettiContainer]);

  return createPortal(
    <Wrapper top={top} left={left} width={width} height={height}>
      <ReactConfetti colors={colors} drawShape={draw} {...confettiProps} />
    </Wrapper>,
    confettiContainer
  );
}

enum ParticleShape {
  Circle = 1,
  Square = 2,
  TShape = 3,
  LShape = 4,
  Triangle = 5,
  QuarterCircle = 6,
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function draw(context: CanvasRenderingContext2D) {
  // All of these are needed to avoid type checking on this because our eslint and ts rules are more strict than @storybook/addon-onboarding
  // @ts-ignore - react-confetti uses this to pass context, but it isn't defined here so it need to be an implicit any. Ignoring to avoid conflicts - otherwise the code is the same as in addon-onboarding
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self: any = this;
  self.shape = self.shape || getRandomInt(1, 6);

  switch (self.shape) {
    case ParticleShape.Square: {
      const cornerRadius = 2;
      const width = self.w / 2;
      const height = self.h / 2;

      context.moveTo(-width + cornerRadius, -height);
      context.lineTo(width - cornerRadius, -height);
      context.arcTo(width, -height, width, -height + cornerRadius, cornerRadius);
      context.lineTo(width, height - cornerRadius);
      context.arcTo(width, height, width - cornerRadius, height, cornerRadius);
      context.lineTo(-width + cornerRadius, height);
      context.arcTo(-width, height, -width, height - cornerRadius, cornerRadius);
      context.lineTo(-width, -height + cornerRadius);
      context.arcTo(-width, -height, -width + cornerRadius, -height, cornerRadius);

      break;
    }
    case ParticleShape.TShape: {
      context.rect(-4, -4, 8, 16);
      context.rect(-12, -4, 24, 8);
      break;
    }
    case ParticleShape.LShape: {
      context.rect(-4, -4, 8, 16);
      context.rect(-4, -4, 24, 8);
      break;
    }
    case ParticleShape.Circle: {
      context.arc(0, 0, self.radius, 0, 2 * Math.PI);
      break;
    }
    case ParticleShape.Triangle: {
      context.moveTo(16, 4);
      context.lineTo(4, 24);
      context.lineTo(24, 24);
      break;
    }
    case ParticleShape.QuarterCircle: {
      context.arc(4, -4, 4, -Math.PI / 2, 0);
      context.lineTo(4, 0);
      break;
    }
    default: {
      break;
    }
  }

  context.closePath();
  context.fill();
}
