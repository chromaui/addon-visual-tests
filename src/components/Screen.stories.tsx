import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { CONFIG_INFO, CONFIG_INFO_DISMISSED } from '../constants';
import { ControlsProvider } from '../screens/VisualTests/ControlsContext';
import { ConfigInfoPayload } from '../types';
import { storyWrapper } from '../utils/storyWrapper';
import { withSetup } from '../utils/withSetup';
import { withSharedState } from '../utils/withSharedState';
import { Screen } from './Screen';

const meta = {
  component: Screen,
  args: {
    children: <div style={{ padding: 15 }}>Hello, world!</div>,
  },
  decorators: [
    storyWrapper(ControlsProvider, ({ parameters }) => ({
      initialState: parameters.initialControls,
    })),
  ],
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const configuration = {
  configFile: 'chromatic.config.json',
  projectId: 'Project:6480e1b0042842f149cfd74c',
  externals: ['public/**'],
  autoAcceptChanges: 'main',
  exitOnceUploaded: true,
};

export const Configuration: Story = {
  decorators: [
    withSharedState(CONFIG_INFO, {
      configuration,
      problems: { storybookBaseDir: 'src/frontend' },
      suggestions: { onlyChanged: true, zip: true },
    } satisfies ConfigInfoPayload),
  ],
  parameters: {
    initialControls: {
      configVisible: true,
    },
  },
};

export const ConfigurationProblems = {
  decorators: [
    withSharedState(CONFIG_INFO, {
      configuration,
      problems: { storybookBaseDir: 'src/frontend' },
    }),
  ],
} satisfies StoryObj<typeof meta>;

export const ConfigurationSuggestions = {
  decorators: [
    withSetup(() => localStorage.removeItem(CONFIG_INFO_DISMISSED)),
    withSharedState(CONFIG_INFO, {
      configuration,
      suggestions: { onlyChanged: true, zip: true },
    }),
  ],
} satisfies StoryObj<typeof meta>;

export const SparseConfiguration = {
  decorators: [
    withSharedState(CONFIG_INFO, {
      configuration: { configFile: configuration.configFile },
      suggestions: { zip: true },
    } satisfies ConfigInfoPayload),
  ],
  parameters: {
    initialControls: {
      configVisible: true,
    },
  },
} satisfies StoryObj<typeof meta>;

export const NoConfiguration = {
  parameters: {
    initialControls: {
      configVisible: true,
    },
  },
} satisfies StoryObj<typeof meta>;
