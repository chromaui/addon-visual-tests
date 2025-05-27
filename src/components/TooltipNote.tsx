import { TooltipNote as OriginalTooltip } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

export const TooltipNote = styled(OriginalTooltip)({
  marginBottom: '-4px',
  marginTop: '-4px',
  left: -8,
});
