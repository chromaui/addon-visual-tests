import { css, styled } from "@storybook/theming";
import React, { MouseEventHandler, SyntheticEvent } from "react";
import { TooltipRenderProps } from "react-joyride";

import { Button } from "../../components/Button";

const TooltipBody = styled.div`
  background: ${({ theme }) => {
    return theme.base === "dark" ? "#292A2C" : theme.color.lightest;
  }};
  width: 260px;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 0px 32px 0px #00000029;
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

const NextButton = styled(Button)(
  ({ secondary }) =>
    secondary &&
    css({
      "&&:focus": { boxShadow: "none" },
    })
);

export type TooltipProps = TooltipRenderProps & {
  step: TooltipRenderProps["step"] & {
    hideSkipButton?: boolean;
    hideNextButton?: boolean;
    nextButtonText?: string;
    onSkipWalkthroughButtonClick?: () => void;
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
      {(step.hideNextButton || step.hideBackButton) && (
        <TooltipFooter id="buttonNext">
          {!step.hideSkipButton && (
            <Button
              onClick={step.onSkipWalkthroughButtonClick}
              link
              style={{ paddingRight: "12px", paddingLeft: "12px", marginRight: "8px" }}
            >
              Skip
            </Button>
          )}
          {!step.hideNextButton && (
            <NextButton
              {...{
                ...primaryProps,
                // @tmeasday - I'm not sure if we ever use this, but this makes the types work
                onClick: primaryProps.onClick as (event: SyntheticEvent) => void,
                secondary: true,
                ...(step.onNextButtonClick ? { onClick: step.onNextButtonClick } : {}),
              }}
            >
              {step.nextButtonText || "Next"}
            </NextButton>
          )}
        </TooltipFooter>
      )}
    </TooltipBody>
  );
};
