import { fileURLToPath } from 'node:url';

import config from './preset.ts';

export default {
  ...config,
  managerEntries: [fileURLToPath(import.meta.resolve('./manager.tsx'))],
};
