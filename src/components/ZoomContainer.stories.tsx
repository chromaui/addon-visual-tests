import { type Meta } from "@storybook/react";
import React from "react";

import { ZoomContainer, ZoomProvider } from "./ZoomContainer";

export default {
  component: ZoomContainer,
  decorators: (Story) => (
    <ZoomProvider>
      <Story />
    </ZoomProvider>
  ),
} satisfies Meta<typeof ZoomContainer>;

export const Default = {
  args: {
    children: <img src="/chromatic-site-desktop.png" alt="" />,
  },
};

export const Wide = {
  args: {
    children: <img src="/chromatic-site-banner.png" alt="" />,
  },
};

export const Tall = {
  args: {
    children: <img src="/chromatic-site-mobile.png" alt="" />,
  },
};

export const Small = {
  args: {
    children: <img src="/capture-16b798d6.png" alt="" />,
  },
};

export const Mirror = {
  render() {
    return (
      <div style={{ display: "flex", height: "100%", gap: 10 }}>
        <ZoomContainer>
          <img src="/A.png" alt="" />
        </ZoomContainer>
        <ZoomContainer>
          <img src="/B.png" alt="" />
        </ZoomContainer>
      </div>
    );
  },
};
