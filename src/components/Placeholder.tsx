import { styled } from 'storybook/theming';

export const Placeholder = styled.div<{
  width?: number;
  height?: number;
  marginLeft?: number;
  marginRight?: number;
}>(({ theme, width = 14, height = 14, marginLeft = 7, marginRight = 8 }) => ({
  display: 'inline-block',
  backgroundColor: theme.appBorderColor,
  borderRadius: 3,
  animation: `${theme.animation.glow} 1.5s ease-in-out infinite`,
  height,
  width,
  margin: 7,
  marginLeft,
  marginRight,
}));
