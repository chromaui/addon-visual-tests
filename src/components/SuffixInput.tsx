import { Input } from "@storybook/design-system/src";
import { styled } from "@storybook/theming";
import React, { ComponentProps, ReactNode } from "react";

const InputWrapper = styled.div(({ theme }) => ({
  position: "relative",

  "&& input": {
    color: theme.input.color || "inherit",
    background: theme.input.background,
    boxShadow: `${theme.input.border} 0 0 0 1px inset`,
    borderRadius: theme.input.borderRadius,
    fontSize: theme.typography.size.s2 - 1,
    lineHeight: "20px",
  },
}));

const SuffixWrapper = styled.div(({ theme }) => ({
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  left: 40,
  right: 0,
  zIndex: 2,
  overflow: "hidden",
  height: 40,
  display: "flex",
  alignItems: "center",
  lineHeight: "20px",
  color: theme.input.color || "inherit",

  span: {
    opacity: 0,
  },
}));

const SuffixOverlay = ({
  value,
  placeholder,
  suffix,
}: {
  value?: string;
  placeholder?: string;
  suffix: ReactNode;
}) => (
  <SuffixWrapper>
    <span>{value || placeholder}</span>
    <b>{suffix}</b>
  </SuffixWrapper>
);

interface SuffixInputProps
  extends Omit<ComponentProps<typeof Input>, "label" | "crossOrigin" | "enterKeyHint"> {
  suffix: string;
}

export const SuffixInput = ({ id, value, placeholder, suffix, ...props }: SuffixInputProps) => {
  return (
    <InputWrapper>
      <Input
        id={id}
        hideLabel
        label=""
        value={value}
        placeholder={placeholder}
        crossOrigin={undefined}
        enterKeyHint={undefined}
        {...props}
      />
      <SuffixOverlay value={value} placeholder={placeholder} suffix={suffix} />
    </InputWrapper>
  );
};
