import { styled } from "@storybook/theming";
import React from "react";
import { TooltipRenderProps } from "react-joyride";

import { Button } from "../../components/Button";

const TooltipBody = styled.div`
  background: ${({ theme }) => {
    return theme.base === "dark" ? "#292A2C" : theme.color.lightest;
  }};
  width: 260px;
  padding: 15px;
  border-radius: 5px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TooltipTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.defaultText};
`;

const TooltipContent = styled.p`
  font-size: 13px;
  line-height: 18px;
  text-align: start;
  color: ${({ theme }) => theme.color.defaultText};
  margin: 0;
  margin-top: 5px;
`;

const TooltipFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

export type TooltipProps = TooltipRenderProps & {
  step: TooltipRenderProps["step"] & {
    hideNextButton?: boolean;
    onNextButtonClick?: () => void;
  };
};

export const Tooltip = ({ step, primaryProps, tooltipProps }: TooltipProps) => {
  return (
    <TooltipBody {...tooltipProps}>
      <Wrapper>
        {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
        <TooltipContent>{step.content}</TooltipContent>
      </Wrapper>
      {!step.hideNextButton && (
        <TooltipFooter id="buttonNext">
          <Button
            {...{
              ...primaryProps,
              ...(step.onNextButtonClick ? { onClick: step.onNextButtonClick } : {}),
            }}
          >
            Next
          </Button>
        </TooltipFooter>
      )}
    </TooltipBody>
  );
};
