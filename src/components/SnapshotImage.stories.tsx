import { Icons } from "@storybook/components";
import React from "react";

import { SnapshotImage } from "./SnapshotImage";

export default {
  component: SnapshotImage,
};

export const Default = {
  args: {
    children: <img src="A.png" alt="" />,
  },
};

export const Diff = {
  args: {
    children: (
      <>
        <img src="B.png" alt="" />
        <img src="B-comparison.png" alt="" />
      </>
    ),
  },
};

export const DiffBigger = {
  args: {
    children: (
      <>
        <img src="diff-bigger.png" alt="" />
        <img src="diff-bigger-comparison.png" alt="" />
      </>
    ),
  },
};

export const Broken = {
  args: {
    children: (
      <div>
        <Icons icon="photo" />
        <p>
          A snapshot couldn’t be captured. This often occurs when a story has a code error. Confirm
          that this story successfully renders in your local Storybook and run the build again.
        </p>
      </div>
    ),
  },
};
