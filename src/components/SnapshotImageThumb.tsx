import { CheckIcon } from "@storybook/icons";
import { styled } from "@storybook/theming";
import React from "react";

const Wrapper = styled.div<{ status?: "positive" }>(({ status, theme }) => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.background.content,
  border: `1px solid ${status === "positive" ? theme.color.green : theme.appBorderColor}`,
  borderRadius: 5,
  margin: "15px 15px 0",
  padding: 5,
  minHeight: 200,
  minWidth: 200,
  maxWidth: 500,

  img: {
    display: "block",
    maxWidth: "100%",
    borderRadius: 3,
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
    <Wrapper status={status} style={backgroundColor ? { backgroundColor } : {}}>
      <img alt="Snapshot thumbnail" src={thumbnailUrl} />
      {status === "positive" && <CheckIcon />}
    </Wrapper>
  );
};
