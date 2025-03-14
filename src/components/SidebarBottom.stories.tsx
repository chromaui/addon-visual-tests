import { fn } from 'storybook/test';

import { ADDON_ID } from '../constants';
import { SidebarBottomBase } from './SidebarBottom';

export default {
  component: SidebarBottomBase,
  args: {
    api: {
      experimental_setFilter: fn().mockName('experimental_setFilter'),
      emit: fn().mockName('emit'),
    },
  },
};

export const Changes = {
  args: {
    status: {
      one: { [ADDON_ID]: { value: 'status-value:warning' } },
      two: { [ADDON_ID]: { value: 'status-value:warning' } },
    },
  },
};

export const Errors = {
  args: {
    status: {
      one: { [ADDON_ID]: { value: 'status-value:error' } },
      two: { [ADDON_ID]: { value: 'status-value:error' } },
    },
  },
};

export const Both = {
  args: {
    status: {
      one: { [ADDON_ID]: { value: 'status-value:warning' } },
      two: { [ADDON_ID]: { value: 'status-value:warning' } },
      three: { [ADDON_ID]: { value: 'status-value:error' } },
      four: { [ADDON_ID]: { value: 'status-value:error' } },
    },
  },
};
