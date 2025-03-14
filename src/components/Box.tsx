import { styled } from 'storybook/theming';

export const Box = styled.div<{ warning?: boolean }>(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.appBorderRadius,
    background: theme.base === 'light' ? theme.color.lightest : theme.color.darkest,
    border: `1px solid ${theme.appBorderColor}`,
    padding: 15,
    flex: 1,
    gap: 14,
    maxWidth: '500px',
    width: '100%',
  }),
  ({ theme, warning }) =>
    warning && { background: theme.base === 'dark' ? '#342e1a' : theme.background.warning }
);

export const BoxTitle = styled.b(() => ({
  display: 'block',
  marginBottom: 2,
}));
