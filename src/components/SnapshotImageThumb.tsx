import { CheckIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";

const Wrapper = styled.div<{ status?: "positive" }>(({ status, theme }) => ({
  position: "relative",
  display: "inline-flex",
  backgroundColor: "white",
  border: `1px solid ${status === "positive" ? theme.color.green : theme.appBorderColor}`,
  borderRadius: 5,
  margin: "15px 15px 0",
  minHeight: 200,
  minWidth: 200,
  maxWidth: 500,

  div: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    border: `2px solid ${theme.background.content}`,
    borderRadius: 4,
    overflow: "hidden",
  },
  img: {
    display: "block",
    maxWidth: "100%",
  },
  svg: {
    position: "absolute",
    top: -12,
    left: -12,
    width: 24,
    height: 24,
    padding: 5,
    color: theme.color.lightest,
    borderRadius: "50%",
    backgroundColor: theme.color.green,
  },
}));

interface SnapshotImageThumbProps {
  backgroundColor?: string | null;
  status?: "positive";
  thumbnailUrl: string;
}

export const SnapshotImageThumb = ({
  backgroundColor,
  status,
  thumbnailUrl,
}: SnapshotImageThumbProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <Wrapper status={status}>
      <div style={backgroundColor ? { backgroundColor } : {}}>
        <img alt="Snapshot thumbnail" src={thumbnailUrl} />
      </div>
      {status === "positive" && <CheckIcon />}
    </Wrapper>
  );
};
