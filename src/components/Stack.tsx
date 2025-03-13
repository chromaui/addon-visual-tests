import type { CSSObject } from 'storybook/theming';
import { styled } from 'storybook/theming';

export const Stack = styled.div<Pick<CSSObject, 'alignItems' | 'textAlign'>>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 15,
  alignItems: props.alignItems ?? 'center',
  textAlign: props.textAlign ?? 'center',
}));
