import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ComparisonResult } from '../gql/graphql';
import { ModeSelector } from './ModeSelector';

const viewport800Px = {
  name: '800px',
};
const viewport1200Px = {
  name: '1200px',
};

const meta = {
  component: ModeSelector,
  args: {
    isAccepted: false,
    onSelectMode: fn().mockName('onSelectMode'),
  },
} satisfies Meta<typeof ModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSingleViewportChanged: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        mode: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportAccepted: Story = {
  args: {
    isAccepted: true,
    selectedMode: viewport1200Px,
    modeResults: [
      {
        mode: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithSingleViewportEqual: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        mode: viewport1200Px,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithSingleViewportError: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        mode: viewport1200Px,
        result: ComparisonResult.CaptureError,
      },
    ],
  },
};

export const WithManyViewportsEqual: Story = {
  args: {
    selectedMode: viewport800Px,
    modeResults: [
      {
        mode: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        mode: viewport1200Px,
        result: ComparisonResult.Equal,
      },
    ],
  },
};

export const WithManyViewportsSecondSelected: Story = {
  args: {
    selectedMode: viewport1200Px,
    modeResults: [
      {
        mode: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        mode: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};

export const WithManyViewportsVaried: Story = {
  args: {
    selectedMode: viewport800Px,
    modeResults: [
      {
        mode: viewport800Px,
        result: ComparisonResult.Equal,
      },
      {
        mode: viewport1200Px,
        result: ComparisonResult.Changed,
      },
    ],
  },
};
