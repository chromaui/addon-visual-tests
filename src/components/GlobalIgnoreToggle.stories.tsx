import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { GlobalIgnoreToggleButton } from './GlobalIgnoreToggle';

type StoryArgs = React.ComponentProps<typeof GlobalIgnoreToggleButton>;

const StatefulButton = (args: StoryArgs) => {
  const [enabled, setEnabled] = React.useState(args.enabled);

  React.useEffect(() => {
    setEnabled(args.enabled);
  }, [args.enabled]);

  return (
    <GlobalIgnoreToggleButton
      {...args}
      enabled={enabled}
      onToggle={() => {
        args.onToggle();
        setEnabled((current) => !current);
      }}
    />
  );
};

const meta = {
  title: 'components/GlobalIgnoreToggle',
  component: GlobalIgnoreToggleButton,
  render: (args) => <StatefulButton {...args} />,
  args: {
    enabled: false,
    ignoreCount: 3,
    locked: false,
    onToggle: fn(),
  },
} satisfies Meta<typeof GlobalIgnoreToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  args: {
    ignoreCount: 0,
  },
};

export const Inactive: Story = {};

export const TogglesPressedState: Story = {
  globals: { theme: 'light' },
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args, canvasElement }) => {
    const toggle = await within(canvasElement).findByRole('switch', {
      name: 'Highlight ignored areas',
    });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
  },
};

export const Active: Story = {
  args: {
    enabled: true,
  },
};

export const LockedByStoryGlobals: Story = {
  args: {
    enabled: true,
    locked: true,
  },
};
