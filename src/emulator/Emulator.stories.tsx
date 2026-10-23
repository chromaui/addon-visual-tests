import type { Meta, StoryObj } from '@storybook/react-vite';
import isChromatic from 'chromatic/isChromatic';
import React from 'react';
import { expect, within } from 'storybook/test';

import { setChromaticIdentity } from './identity';
import { getPageBackground, removeMask, renderMask } from './mask';
import { type Box, measureCaptureBox } from './measure';
import { applyCaptureTweaks, EMULATOR_ATTRIBUTE, removeCaptureTweaks } from './tweaks';

const fadeIn = `
  @keyframes emulator-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .fade-in { animation: emulator-fade-in 10s linear; }
`;

/** Renders a page-like fixture: a root (acting as the body) with a padded story container. */
const Fixture = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="root" style={{ position: 'relative', padding: 16 }}>
    <style>{fadeIn}</style>
    <div data-testid="container" style={{ padding: 16 }}>
      {children}
    </div>
  </div>
);

const Block = ({ style, ...props }: React.ComponentProps<'div'>) => (
  <div style={{ width: 100, height: 50, background: 'tomato', ...style }} {...props} />
);

const IsChromatic = () => <code>{String(isChromatic())}</code>;

const documentRect = (element: Element): Box => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return {
    left: Math.floor(left + window.scrollX),
    top: Math.floor(top + window.scrollY),
    right: Math.ceil(right + window.scrollX),
    bottom: Math.ceil(bottom + window.scrollY),
  };
};

const measure = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  return measureCaptureBox(document, {
    root: canvas.getByTestId('root'),
    container: canvas.getByTestId('container'),
  });
};

const meta = {
  title: 'emulator/Emulator',
  component: Fixture,
  globals: { theme: 'light' },
  parameters: { chromatic: { disableSnapshot: true } },
  args: { children: null },
} satisfies Meta<typeof Fixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MeasuresContentNotContainer: Story = {
  args: { children: <Block data-testid="content" /> },
  play: async ({ canvasElement }) => {
    const content = within(canvasElement).getByTestId('content');
    await expect(measure(canvasElement)).toEqual(documentRect(content));
  },
};

export const MeasuresOverflow: Story = {
  args: {
    children: (
      <>
        <Block data-testid="content" style={{ position: 'relative' }}>
          <Block
            data-testid="overflow"
            style={{ position: 'absolute', left: 80, top: 30, background: 'gold' }}
          />
        </Block>
        <Block style={{ position: 'relative', overflow: 'hidden' }}>
          <Block style={{ position: 'absolute', left: 500, background: 'gold' }} />
        </Block>
        <Block style={{ position: 'absolute', left: 800, visibility: 'hidden' }} />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = documentRect(canvas.getByTestId('content'));
    const overflow = documentRect(canvas.getByTestId('overflow'));
    // The second block is below the first, so the bottom is the bottom of the second block
    const container = documentRect(canvas.getByTestId('container'));
    await expect(measure(canvasElement)).toEqual({
      left: content.left,
      top: content.top,
      right: overflow.right,
      bottom: container.bottom - 16,
    });
  },
};

export const MeasuresFixedElements: Story = {
  args: {
    children: (
      <>
        <Block data-testid="content" />
        <div>
          <Block data-testid="fixed" style={{ position: 'fixed', left: 300, top: 200 }} />
        </div>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = documentRect(canvas.getByTestId('content'));
    const fixed = documentRect(canvas.getByTestId('fixed'));
    await expect(measure(canvasElement)).toEqual({
      left: content.left,
      top: content.top,
      right: fixed.right,
      bottom: fixed.bottom,
    });
  },
};

export const FreezesAnimationsAtEnd: Story = {
  args: { children: <Block data-testid="content" className="fade-in" /> },
  play: async ({ canvasElement }) => {
    const content = within(canvasElement).getByTestId('content');
    try {
      await applyCaptureTweaks(document, { animations: true });
      await expect(getComputedStyle(content).opacity).toBe('1');
      await expect(content.getAnimations()[0].playState).toBe('paused');
    } finally {
      removeCaptureTweaks(document);
    }
    await expect(document.querySelector(`style[${EMULATOR_ATTRIBUTE}]`)).toBeNull();
    await expect(content.getAnimations()[0].playState).toBe('running');
  },
};

export const FreezesAnimationsAtStart: Story = {
  args: { children: <Block data-testid="content" className="fade-in" /> },
  play: async ({ canvasElement }) => {
    const content = within(canvasElement).getByTestId('content');
    try {
      await applyCaptureTweaks(document, { animations: true, pauseAnimationAtEnd: false });
      await expect(getComputedStyle(content).opacity).toBe('0');
    } finally {
      removeCaptureTweaks(document);
    }
  },
};

export const HidesCarets: Story = {
  args: { children: <input data-testid="input" defaultValue="Hello" /> },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByTestId('input');
    const caretColor = getComputedStyle(input).caretColor;
    try {
      await applyCaptureTweaks(document, { carets: true, identity: true });
      await expect(getComputedStyle(input).caretColor).toBe('rgba(0, 0, 0, 0)');
      await expect(document.body).toHaveAttribute('spellcheck', 'false');
      await expect(document.body).toHaveAttribute('data-chromatic', 'true');
    } finally {
      removeCaptureTweaks(document);
    }
    await expect(getComputedStyle(input).caretColor).toBe(caretColor);
    await expect(document.body).not.toHaveAttribute('spellcheck');
    await expect(document.body).not.toHaveAttribute('data-chromatic');
  },
};

export const IdentifiesAsChromatic: Story = {
  play: async () => {
    const userAgent = navigator.userAgent;
    try {
      setChromaticIdentity(true);
      await expect(isChromatic()).toBe(true);
      await expect(navigator.userAgent).toBe(`${userAgent} (Chromatic capture)`);
    } finally {
      setChromaticIdentity(false);
    }
    await expect(navigator.userAgent).toBe(userAgent);
    await expect(new URL(location.href).searchParams.has('chromatic')).toBe(false);
  },
};

export const MasksWithPageBackground: Story = {
  args: { children: <Block data-testid="content" /> },
  play: async ({ canvasElement }) => {
    const { background } = document.body.style;
    document.body.style.background = 'rgb(20, 30, 40)';
    try {
      await expect(getPageBackground(document)).toBe('rgb(20, 30, 40)');
      renderMask(document, measure(canvasElement));
      const fill = document.querySelector<HTMLElement>(`[${EMULATOR_ATTRIBUTE}] [data-fill]`);
      await expect(fill).toHaveStyle({ backgroundColor: 'rgb(20, 30, 40)' });
    } finally {
      removeMask(document);
      document.body.style.background = background;
    }
    await expect(document.querySelector(`[${EMULATOR_ATTRIBUTE}]`)).toBeNull();
  },
};

/** Try out the Chromatic emulator from the toolbar, with a few modes and things to freeze. */
export const Playground: Story = {
  args: {
    children: (
      <>
        <Block className="fade-in" />
        <p>
          <input defaultValue="Focus me to see the caret" /> isChromatic(): <IsChromatic />
        </p>
      </>
    ),
  },
  parameters: {
    chromatic: {
      modes: {
        Mobile: { viewport: 'mobile1' },
        Desktop: { viewport: { width: 1024, height: 768 } },
      },
    },
  },
};
