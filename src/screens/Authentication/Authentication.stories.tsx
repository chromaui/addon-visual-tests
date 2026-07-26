// @ts-nocheck TODO: Address SB 8 type errors
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, findByRole, fn, userEvent } from 'storybook/test';

import { ADDON_ID, HIGHLIGHT_IGNORED_PARAM } from '../../constants';
import { panelModes } from '../../modes';
import { GraphQLClientProvider } from '../../utils/graphQLClient';
import { playAll } from '../../utils/playAll';
import { storyWrapper } from '../../utils/storyWrapper';
import { telemetrySpy } from '../../utils/telemetrySpy';
import { clearSessionState } from '../../utils/useSessionState';
import { withFigmaDesign } from '../../utils/withFigmaDesign';
import { withSetup } from '../../utils/withSetup';
import { Authentication } from './Authentication';

const meta = {
  component: Authentication,
  decorators: [withSetup(clearSessionState), storyWrapper(GraphQLClientProvider)],
  args: {
    setAccessToken: fn().mockName('setAccessToken'),
    hasProjectId: false,
  },
  parameters: {
    chromatic: {
      modes: panelModes,
    },
    msw: {
      handlers: [
        http.post('*/authorize', () =>
          HttpResponse.json({
            device_code: 'chdc_95a7123d17a84851abcdefc869ec0741',
            user_code: '123 123',
            verification_uri: 'https://www.chromatic.com/connect/chromaui:addon-visual-tests',
            verification_uri_complete:
              'https://www.chromatic.com/connect/chromaui:addon-visual-tests?code=123123',
            expires_in: 300,
            interval: 5,
          })
        ),
        http.post('*/token', () =>
          HttpResponse.json({
            error: 'authorization_pending',
            error_description: 'Authorization is pending approval',
          })
        ),
      ],
    },
  },
} satisfies Meta<typeof Authentication>;

const telemetry = telemetrySpy();

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome = {
  globals: {
    [HIGHLIGHT_IGNORED_PARAM]: true,
  },
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4'
  ),
} satisfies Story;

export const HasProjectId = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317931&t=3EAIRe8423CpOQWY-4'
  ),
  args: {
    hasProjectId: true,
  },
} satisfies Story;

export const SignIn = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-317993&t=3EAIRe8423CpOQWY-4'
  ),
  play: playAll(async ({ canvasElement }) => {
    const button = await findByRole(canvasElement, 'button', {
      name: /Get started/,
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const SSO = {
  parameters: withFigmaDesign(
    'https://www.figma.com/file/p4ZIW7diUWC2l2DAf5xpYI/Storybook-Connect-plugin-(EXTERNAL-USE)?type=design&node-id=1-1734&t=ysgtc5qR40kqRKtI-4'
  ),
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, 'button', {
      name: 'Sign in with SSO',
    });
    await userEvent.click(button);
  }),
} satisfies Story;

export const Verify = {
  parameters: {
    chromatic: {
      ignoreSelectors: ['ol'],
    },
    ...withFigmaDesign(
      'https://www.figma.com/file/GFEbCgCVDtbZhngULbw2gP/Visual-testing-in-Storybook?type=design&node-id=304-318063&t=3EAIRe8423CpOQWY-4'
    ),
  },
  play: playAll(SignIn, async (context) => {
    const button = await findByRole(context.canvasElement, 'button', {
      name: 'Sign in with Chromatic',
    });
    await userEvent.click(button);
  }),
} satisfies Story;

/**
 * Telemetry stories. These assert on reported events rather than appearance, so they opt out of
 * snapshots and pin to a single theme (the default renders two canvases sharing one spy).
 */
const telemetryParameters = {
  theme: 'light',
  chromatic: { disableSnapshot: true },
};

export const ReportsContinueFromWelcome = {
  decorators: telemetry.decorators,
  parameters: telemetryParameters,
  play: playAll(async ({ canvasElement }) => {
    await userEvent.click(await findByRole(canvasElement, 'button', { name: /Get started/ }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'continue',
      location: 'Authentication',
      screen: 'Welcome',
    });
  }),
} satisfies Story;

export const ReportsSignInWithSSO = {
  decorators: telemetry.decorators,
  parameters: telemetryParameters,
  play: playAll(SignIn, async ({ canvasElement }) => {
    await userEvent.click(await findByRole(canvasElement, 'button', { name: 'Sign in with SSO' }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'signInWithSSO',
      location: 'Authentication',
      screen: 'Signin',
    });
  }),
} satisfies Story;

export const ReportsSignInWhenPersistedWelcomeHasProject = {
  args: {
    hasProjectId: true,
  },
  decorators: [
    ...telemetry.decorators,
    withSetup(() => {
      sessionStorage.setItem(`${ADDON_ID}/state/authenticationScreen`, JSON.stringify('welcome'));
    }),
  ],
  parameters: telemetryParameters,
  play: async ({ canvasElement }) => {
    await userEvent.click(await findByRole(canvasElement, 'button', { name: 'Sign in with SSO' }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'signInWithSSO',
      location: 'Authentication',
      screen: 'Signin',
    });
  },
} satisfies Story;

export const ReportsGoBackFromSignIn = {
  decorators: telemetry.decorators,
  parameters: telemetryParameters,
  play: playAll(SignIn, async ({ canvasElement }) => {
    await userEvent.click(await findByRole(canvasElement, 'button', { name: 'Go back' }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'goBack',
      location: 'Authentication',
      screen: 'Signin',
    });
  }),
} satisfies Story;

export const ReportsSignInFromVerify = {
  decorators: telemetry.decorators,
  parameters: { ...telemetryParameters, chromatic: { disableSnapshot: true } },
  play: playAll(Verify, async ({ canvasElement }) => {
    // Verify reports this itself via `useTrackAction`, tagged with the screen Authentication
    // reported the view for — no `trackEvent` prop threaded down.
    await userEvent.click(await findByRole(canvasElement, 'button', { name: 'Go to Chromatic' }));
    await expect(telemetry.trackEvent).toHaveBeenCalledWith({
      action: 'signIn',
      location: 'Authentication',
      screen: 'Verify',
    });
  }),
} satisfies Story;
