import { ActionList } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

export const ActionButton = styled(ActionList.Button)({
  '@container (max-width: 299px)': {
    height: 28,
    padding: '0 7px',
  },
  '@container (min-width: 800px)': {
    height: 28,
    padding: '0 7px',
  },
});
