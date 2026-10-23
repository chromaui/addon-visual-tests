import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, screen, userEvent, within } from 'storybook/test';

import { DEFAULT_EMULATOR_SETTINGS } from '../emulator/settings';
import { EmulatorMenu } from './EmulatorMenu';
import { EmulatorButton } from './EmulatorTool';

const allOn = { viewport: true, rendering: true, identity: true };

const meta = {
  title: 'components/EmulatorMenu',
  component: EmulatorMenu,
  globals: { theme: 'light' },
  args: {
    settings: allOn,
    locked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof EmulatorMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {};

export const Disabled: Story = {
  args: {
    settings: DEFAULT_EMULATOR_SETTINGS,
  },
};

export const PartiallyEnabled: Story = {
  args: {
    settings: { ...DEFAULT_EMULATOR_SETTINGS, rendering: true },
  },
};

export const LockedByStoryGlobals: Story = {
  args: {
    locked: true,
  },
};

export const TogglesParts: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { settings: DEFAULT_EMULATOR_SETTINGS },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: /Capture rendering/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, rendering: true });

    await userEvent.click(canvas.getByRole('checkbox', { name: /Identify as Chromatic/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, identity: true });

    await userEvent.click(canvas.getByRole('checkbox', { name: /Viewport & capture area/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, viewport: true });
  },
};

export const LinksToDocs: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Learn more' });
    await expect(link).toHaveAttribute('href', 'https://www.chromatic.com/docs/snapshots/');
    await expect(link).toHaveAttribute('target', '_blank');
  },
};

export const PartsDisabledWhenLocked: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { locked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: /Capture rendering/ })).toBeDisabled();
    await expect(canvas.getByText(/set by the story globals/)).toBeInTheDocument();
  },
};

export const ToolbarButton: Story = {
  render: (args) => <EmulatorButton {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Chromatic emulator' })
    );
    await expect(
      await screen.findByRole('checkbox', { name: /Capture rendering/ })
    ).toBeInTheDocument();
  },
};
