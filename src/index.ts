import { definePreviewAddon } from 'storybook/internal/csf';

import type { ChromaticTypes } from './types';

export type { ChromaticTypes } from './types';

export default () => definePreviewAddon<ChromaticTypes>({});
