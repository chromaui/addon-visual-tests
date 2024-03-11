import React from "react";

import { ZoomContainer } from "./ZoomContainer";

export default {
  component: ZoomContainer,
};

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
