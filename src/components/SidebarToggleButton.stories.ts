import { fn } from 'storybook/test';

import { SidebarToggleButton } from './SidebarToggleButton';

export default {
  component: SidebarToggleButton,
  args: {
    active: false,
    onClick: fn().mockName('onClick'),
  },
};

export const Changes = {
  args: {
    count: 12,
    label: 'Change',
    status: 'warning',
  },
};

export const ChangesActive = {
  args: {
    ...Changes.args,
    active: true,
  },
};

export const Errors = {
  args: {
    count: 2,
    label: 'Error',
    status: 'critical',
  },
};

export const ErrorsActive = {
  args: {
    ...Errors.args,
    active: true,
  },
};
