import { styled } from 'storybook/theming';

export const ShareContainer = styled.div<{ $gap?: number; $center?: boolean }>(
  ({ $gap = 16, $center = false }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 24,
    width: 400,
    maxWidth: 400,
    boxSizing: 'border-box',
    gap: $gap,
    ...($center && {
      alignItems: 'center',
      textAlign: 'center' as const,
    }),
  })
);

export const ShareTitle = styled.div(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
  lineHeight: '20px',
}));

export const ShareDescription = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2,
  color: theme.textMutedColor,
  lineHeight: '20px',
  width: '100%',
}));

export const ShareCTAButton = styled.button(({ theme }) => ({
  minHeight: 32,
  padding: '6px 9px',
  borderRadius: 4,
  backgroundColor: theme.color.secondary,
  color: theme.color.lightest,
  fontWeight: theme.typography.weight.bold,
  fontSize: theme.typography.size.s2,
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  '&:hover': {
    opacity: 0.9,
  },
}));

export const ShareTextLink = styled.button<{ $underline?: boolean }>(({ theme, $underline }) => ({
  fontSize: theme.typography.size.s1,
  color: theme.color.secondary,
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  lineHeight: '16px',
  textDecoration: $underline ? 'underline' : 'none',
}));

export const TextBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const ButtonStack = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  gap: 8,
});

export const ButtonRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});

export const StatusRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: theme.typography.size.s1,
  color: theme.textMutedColor,
}));
