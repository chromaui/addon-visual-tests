import type { Meta, StoryObj } from '@storybook/react';
import isChromatic from 'chromatic/isChromatic';
import React, { ComponentProps, useEffect, useState } from 'react';
import { fn, screen, userEvent, within } from 'storybook/test';

import { INITIAL_BUILD_PAYLOAD } from '../buildSteps';
import { playAll } from '../utils/playAll';
import { SidebarTopButton } from './SidebarTopButton';

const meta = {
  component: SidebarTopButton,
  args: {
    startBuild: fn().mockName('startBuild'),
    stopBuild: fn().mockName('stopBuild'),
  },
} satisfies Meta<typeof SidebarTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Run tests' });
    await userEvent.click(button);
  }),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const DisabledWarning: Story = {
  args: {
    isDisabled: true,
    warning: 'You must be logged in to run tests',
    clickWarning: fn().mockName('clickWarning'),
  },
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Visual tests locked' });
    await userEvent.hover(button);
  }),
};

export const Outdated: Story = {
  args: {
    isOutdated: true,
  },
};

const WithProgress = (props: ComponentProps<typeof SidebarTopButton>) => {
  const [buildProgressPercentage, setProgress] = useState(20);
  useEffect(() => {
    if (isChromatic()) return () => {};
    const interval = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 1 : 0));
    }, 300);
    return () => clearInterval(interval);
  }, []);
  return (
    <SidebarTopButton
      {...props}
      isRunning
      localBuildProgress={{
        ...INITIAL_BUILD_PAYLOAD,
        buildProgressPercentage,
        currentStep: 'build',
      }}
    />
  );
};

export const Running: Story = {
  render: WithProgress,
  play: playAll(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Stop tests' });
    // Wait one second just to ensure the screen has proper focus
    await new Promise((r) => setTimeout(r, 1000));
    await userEvent.hover(button);
    await screen.findAllByText('🏗 Building your Storybook...');
  }),
};

export const Unstoppable: Story = {
  ...Running,
  args: {
    isDisallowed: true,
  },
};
