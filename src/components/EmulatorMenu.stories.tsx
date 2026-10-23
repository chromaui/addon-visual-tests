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

const meta = {
  title: 'components/EmulatorMenu',
  component: EmulatorMenu,
  globals: { theme: 'light' },
  args: {
    settings: { ...DEFAULT_EMULATOR_SETTINGS, enabled: true },
    locked: false,
    onChange: fn(),
    modes: [defaultMode],
    selectedMode: defaultMode,
    onSelectMode: fn(),
    pauseAnimationAtEnd: true,
    unemulated: [],
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
    unemulated: ['color scheme: dark', 'browser locale: fr-FR'],
  },
};

export const PartiallyDisabled: Story = {
  args: {
    settings: { ...DEFAULT_EMULATOR_SETTINGS, enabled: true, mask: false, identity: false },
  },
};

export const LockedByStoryGlobals: Story = {
  args: {
    locked: true,
  },
};

export const TogglesParts: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { modes },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: /Freeze animations/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, animations: false });

    await userEvent.click(canvas.getByRole('checkbox', { name: /^Chromatic emulator/ }));
    await expect(args.onChange).toHaveBeenCalledWith({ ...args.settings, enabled: false });

    await userEvent.click(canvas.getByRole('button', { name: /Desktop dark/ }));
    await expect(args.onSelectMode).toHaveBeenCalledWith('Desktop dark');
  },
};

export const PartsDisabledWhenOff: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { settings: DEFAULT_EMULATOR_SETTINGS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: /Freeze animations/ })).toBeDisabled();
    await expect(canvas.getByRole('checkbox', { name: /^Chromatic emulator/ })).toBeEnabled();
  },
};

export const ToolbarButton: Story = {
  render: (args) => <EmulatorButton {...args} />,
  args: { unemulated: ['color scheme: dark'] },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Chromatic emulator' })
    );
    await expect(
      await screen.findByRole('checkbox', { name: /Freeze animations/ })
    ).toBeInTheDocument();
  },
};
