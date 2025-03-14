import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { fn, userEvent, within } from 'storybook/test';

import { Container } from './Container';
import { StatusDot } from './StatusDot';
import { TooltipMenu } from './TooltipMenu';

const meta = {
  component: TooltipMenu,
  args: {
    children: 'Menu',
    note: 'Click to open menu',
    links: [
      { id: '1', onClick: fn().mockName('1'), title: 'One' },
      { id: '2', onClick: fn().mockName('2'), title: 'Two' },
      { id: '3', onClick: fn().mockName('3'), title: 'Three' },
    ],
  },
  decorators: [
    (Story) => (
      <Container style={{ display: 'inline-flex', paddingTop: 120, width: 200 }}>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof TooltipMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Hover = {
  play: async ({ canvasElement }) => {
    const buttons = await within(canvasElement).findAllByRole('button');
    buttons.forEach((button) => userEvent.hover(button));
  },
} satisfies Story;

export const Open = {
  play: async ({ canvasElement }) => {
    const buttons = await within(canvasElement).findAllByRole('button');
    buttons.forEach((button) => userEvent.click(button));
  },
} satisfies Story;

export const Icons = {
  args: {
    links: [
      { id: '1', onClick: fn().mockName('1'), title: 'One', icon: '🍔' },
      { id: '2', onClick: fn().mockName('2'), title: 'Two', icon: '🍟' },
      { id: '3', onClick: fn().mockName('3'), title: 'Three', icon: '🥤' },
    ],
  },
  play: Open.play,
} satisfies Story;

export const Status = {
  args: {
    links: [
      {
        id: '1',
        onClick: fn().mockName('1'),
        title: 'One',
        right: <StatusDot status="negative" />,
      },
      { id: '2', onClick: fn().mockName('2'), title: 'Two', right: <StatusDot status="warning" /> },
      {
        id: '3',
        onClick: fn().mockName('3'),
        title: 'Three',
        right: <StatusDot status="positive" />,
      },
    ],
  },
  play: Open.play,
} satisfies Story;
