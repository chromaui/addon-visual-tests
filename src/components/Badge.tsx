import { ReactNode } from 'react';
import { Badge as BaseBadge } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

type BadgeProps = React.ComponentProps<typeof BaseBadge>;

// NOTE: The `Badge` exported by `@storybook/components` incorrectly isn't typed to accept children
export const Badge: React.FC<BadgeProps & { children?: ReactNode }> = styled(BaseBadge)({
  padding: '4px 8px',
  margin: '0 6px',
});
