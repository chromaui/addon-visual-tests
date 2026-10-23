import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, screen, userEvent, within } from 'storybook/test';

import { resolveCaptureModes } from '../emulator/modes';
import { DEFAULT_EMULATOR_SETTINGS } from '../emulator/settings';
import { EmulatorMenu } from './EmulatorMenu';
import { EmulatorButton } from './EmulatorTool';

const [defaultMode] = resolveCaptureModes({});
const modes = resolveCaptureModes({
  chromatic: {
    modes: {
      Mobile: { viewport: 'mobile1', theme: 'light' },
      Desktop: { viewport: 1440, theme: 'light' },
      'Desktop dark': { viewport: 1440, theme: 'dark', colorScheme: 'dark' },
    },
  },
});

const allOn = { viewport: true, rendering: true, identity: true };

const meta = {
  title: 'components/EmulatorMenu',
  component: EmulatorMenu,
  globals: { theme: 'light' },
  args: {
    settings: allOn,
    locked: false,
    onChange: fn(),
    modes: [defaultMode],
    selectedMode: defaultMode,
    onSelectMode: fn(),
    pauseAnimationAtEnd: true,
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

export const MultipleModes: Story = {
  args: {
    modes,
    selectedMode: modes[2],
    pauseAnimationAtEnd: false,
  },
};

export const SingleMode: Story = {
  args: {
    modes: [modes[0]],
    selectedMode: modes[0],
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

export const HidesDefaultMode: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Mode')).not.toBeInTheDocument();
    await expect(canvas.queryByText('1200px')).not.toBeInTheDocument();
  },
};

export const TogglesParts: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { modes, selectedMode: modes[0], settings: DEFAULT_EMULATOR_SETTINGS },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: /Capture rendering/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, rendering: true });

    await userEvent.click(canvas.getByRole('checkbox', { name: /Viewport & capture area/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, viewport: true });

    await userEvent.click(canvas.getByRole('button', { name: /Desktop dark/ }));
    await expect(args.onSelectMode).toHaveBeenCalledWith('Desktop dark');
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
