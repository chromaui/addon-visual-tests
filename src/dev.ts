import config from './preset';

export default {
  ...config,
  managerEntries: [require.resolve('./manager.tsx')],
};
