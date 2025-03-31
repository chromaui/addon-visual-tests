import { styled } from 'storybook/theming';

export const Eyebrow = styled.div(({ theme }) => ({
  background: theme.background.app,
  padding: '9px 15px',
  lineHeight: '21px',
  color: theme.color.defaultText,
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));
