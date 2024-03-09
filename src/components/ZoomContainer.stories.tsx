import React from "react";

import { ZoomContainer } from "./ZoomContainer";

export default {
  component: ZoomContainer,
};

export const Default = {
  args: {
    children: (
      <>
        <img src="/A.png" alt="" />
        <br />
        <img src="/A.png" alt="" />
      </>
    ),
  },
};

export const Wide = {
  args: {
    children: (
      <>
        <img src="/A.png" alt="" />
        <img src="/A.png" alt="" />
      </>
    ),
  },
};

export const Tall = {
  args: {
    children: (
      <>
        <img src="/A.png" alt="" />
        <br />
        <img src="/A.png" alt="" />
        <br />
        <img src="/A.png" alt="" />
        <br />
        <img src="/A.png" alt="" />
      </>
    ),
  },
};
