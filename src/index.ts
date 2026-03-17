import { definePreviewAddon } from 'storybook/internal/csf';

import * as addonAnnotations from './preview.ts';
import type { ChromaticTypes } from './types';

export default () => definePreviewAddon<ChromaticTypes>(addonAnnotations);
