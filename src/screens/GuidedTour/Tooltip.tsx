import React, { SyntheticEvent } from 'react';
import { TooltipRenderProps } from 'react-joyride';
import { styled } from 'storybook/theming';

import { Button } from '../../components/Button';

const TooltipBody = styled.div(({ theme }) => ({
  background: theme.base === 'light' ? theme.color.lightest : '#292A2C',
  width: 260,
  padding: 15,
  borderRadius: 5,
  boxShadow: '0px 0px 32px 0px #00000029',
}));

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const TooltipTitle = styled.div(({ theme }) => ({
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 700,
  color: theme.color.defaultText,
}));

const TooltipContent = styled.div(({ theme }) => ({
  fontSize: 13,
  lineHeight: '18px',
  textAlign: 'start',
  color: theme.color.defaultText,
  margin: 0,
  marginTop: 5,
}));

const TooltipFooter = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 15,
});

export type TooltipProps = TooltipRenderProps & {
  step: TooltipRenderProps['step'] & {
    hideSkipButton?: boolean;
    hideNextButton?: boolean;
    nextButtonText?: string;
    onSkipWalkthroughButtonClick?: () => void;
    onNextButtonClick?: () => void;
  };
};

export const Tooltip = ({ isLastStep, step, primaryProps, tooltipProps }: TooltipProps) => {
  return (
    <TooltipBody {...tooltipProps}>
      <Wrapper>
        {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
        <TooltipContent>{step.content}</TooltipContent>
      </Wrapper>
      {(step.hideNextButton || step.hideBackButton) && (
        <TooltipFooter id="buttonSkip">
          {!step.hideSkipButton && !isLastStep && (
            <Button
              size="medium"
              onClick={step.onSkipWalkthroughButtonClick}
              link
              style={{ paddingRight: 12, paddingLeft: 12, marginRight: 8 }}
            >
              Skip
            </Button>
          )}
          {!step.hideNextButton && (
            <Button
              {...{
                ...primaryProps,
                // @tmeasday - I'm not sure if we ever use this, but this makes the types work
                onClick: primaryProps.onClick as (event: SyntheticEvent) => void,
                variant: 'solid',
                ...(step.onNextButtonClick ? { onClick: step.onNextButtonClick } : {}),
              }}
            >
              {step.nextButtonText || 'Next'}
            </Button>
          )}
        </TooltipFooter>
      )}
    </TooltipBody>
  );
};
