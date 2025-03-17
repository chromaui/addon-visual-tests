import { action } from 'storybook/actions';

import { ADDON_ID } from '../constants';
import { SidebarBottomBase } from './SidebarBottom';

export default {
  component: SidebarBottomBase,
  args: {
    api: { experimental_setFilter: action('experimental_setFilter'), emit: action('emit') },
  },
};

export const Changes = {
  args: {
    status: {
      one: { [ADDON_ID]: { status: 'warn' } },
      two: { [ADDON_ID]: { status: 'warn' } },
    },
  },
};

export const Errors = {
  args: {
    status: {
      one: { [ADDON_ID]: { status: 'error' } },
      two: { [ADDON_ID]: { status: 'error' } },
    },
  },
};

export const Both = {
  args: {
    status: {
      one: { [ADDON_ID]: { status: 'warn' } },
      two: { [ADDON_ID]: { status: 'warn' } },
      three: { [ADDON_ID]: { status: 'error' } },
      four: { [ADDON_ID]: { status: 'error' } },
    },
  },
};
