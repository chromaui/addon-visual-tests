import { ChangedIcon, FailedIcon, PassedIcon } from "@storybook/icons";
import { useTheme } from "storybook/internal/theming";
import React from "react";

const styles = { width: 12, height: 12, margin: "3px 3px 3px 6px", verticalAlign: "top" };

export const StatusIcon = ({ icon }: { icon: "passed" | "changed" | "failed" }) => {
  const { color } = useTheme();
  return {
    passed: <PassedIcon style={{ ...styles, color: color.positive }} />,
    changed: <ChangedIcon style={{ ...styles, color: color.warning }} />,
    failed: <FailedIcon style={{ ...styles, color: color.negative }} />,
  }[icon];
};
