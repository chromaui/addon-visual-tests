import { ManagerContext } from 'storybook/manager-api';
import type { Decorator, Loader, Preview } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Global,
  ThemeProvider,
  convert,
  createReset,
  styled,
  themes,
  useTheme,
} from 'storybook/theming';
import { HttpResponse, graphql } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';

import { AuthProvider } from '../src/AuthContext';
import { baseModes } from '../src/modes';
import { UninstallProvider } from '../src/screens/Uninstalled/UninstallContext';
import { RunBuildProvider } from '../src/screens/VisualTests/RunBuildContext';
import { GraphQLClientProvider } from '../src/utils/graphQLClient';
import { storyWrapper } from '../src/utils/storyWrapper';
import { TelemetryProvider } from '../src/utils/TelemetryContext';
import { useSessionState } from '../src/utils/useSessionState';
import { action } from 'storybook/actions';

// Initialize MSW
initialize({
  onUnhandledRequest(req) {
    if (new URL(req.url).origin !== document.location.origin) {
      console.error(
        `[MSW] %s %s %s (UNHANDLED)`,
        new Date().toTimeString().slice(0, 8),
        req.method.toUpperCase(),
        req.url
      );
    }
  },
});

const Panels = styled.div<{ orientation: 'right' | 'bottom' }>(
  ({ orientation }) => ({
    flexDirection: orientation === 'right' ? 'row' : 'column',
  }),
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    padding: 40,
  }
);

const Panel = styled.div<{ orientation: 'right' | 'bottom' }>(
  ({ orientation }) => ({
    width: orientation === 'right' ? 420 : 880,
    height: orientation === 'right' ? 640 : 300,
    overflow: 'auto',
  }),
  ({ theme }) => ({
    containerType: 'size',
    containerName: 'storybookRoot',
    position: 'relative',
    outline: `1px solid ${theme.appBorderColor}`,
    // Add a backdrop to the outline because appBorderColor is semi-transparent
    boxShadow: `0 0 0 1px ${theme.background.content}`,
    background: theme.background.content,
    color: theme.base === 'light' ? theme.color.dark : theme.color.mediumlight,
    fontSize: theme.typography.size.s2,
  })
);

const ThemedSetRoot = () => {
  const theme = useTheme();
  React.useEffect(() => {
    document.body.style.background = theme.background.content;
    document.body.style.color = theme.color.defaultText;
    document.body.style.fontSize = `${theme.typography.size.s2}px`;
  });
  return null;
};

// Render two panels side-by-side or stacked, depending on selected orientation
// Note this assumes any play functions are equipped to deal with multiple canvases
const withTheme = (StoryFn, { globals, parameters }) => {
  const theme = globals.theme || parameters.theme || 'right';
  return theme === 'light' || theme === 'dark' ? (
    <ThemeProvider theme={convert(themes[theme])}>
      <Global styles={createReset} />
      <Global
        styles={{
          '#storybook-root': {
            height: '100vh',
            padding: 0,
            containerType: 'size',
            containerName: 'storybookRoot',
          },
        }}
      ></Global>
      <ThemedSetRoot />
      <StoryFn />
    </ThemeProvider>
  ) : (
    <>
      <ThemeProvider theme={convert(themes.light)}>
        <Global styles={createReset} />
        <ThemedSetRoot />
      </ThemeProvider>
      <Panels orientation={theme}>
        <ThemeProvider theme={convert(themes.light)}>
          <Panel orientation={theme} data-canvas={theme}>
            <StoryFn />
          </Panel>
        </ThemeProvider>
        <ThemeProvider theme={convert(themes.dark)}>
          <Panel orientation={theme} data-canvas={theme}>
            <StoryFn />
          </Panel>
        </ThemeProvider>
      </Panels>
    </>
  );
};

const withGraphQLClient = storyWrapper(GraphQLClientProvider);

const withTelemetry = storyWrapper(TelemetryProvider, () => ({
  value: fn().mockName('telemetry'),
}));

const withAuth = storyWrapper(AuthProvider, () => ({
  value: {
    accessToken: 'token',
    setAccessToken: fn(),
  },
}));

const withManagerApi = storyWrapper(ManagerContext.Provider, ({ argsByTarget }) => ({
  value: {
    api: { ...argsByTarget['manager-api'] },
    state: {},
  },
}));

const withUninstall: Decorator = (Story) => {
  const [addonUninstalled, setAddonUninstalled] = useSessionState('addonUninstalled', false);
  return (
    <UninstallProvider
      addonUninstalled={addonUninstalled}
      setAddonUninstalled={setAddonUninstalled}
    >
      <Story />
    </UninstallProvider>
  );
};

const withRunBuild = storyWrapper(RunBuildProvider, ({ args }) => ({
  watchState: {
    isRunning:
      !!args.localBuildProgress &&
      !['aborted', 'complete', 'error'].includes(args.localBuildProgress.currentStep),
    startBuild: fn().mockName('startBuild'),
    stopBuild: fn().mockName('stopBuild'),
  },
}));

/**
 * An experiment with targeted args for GraphQL. This loader will serve a graphql
 * response for any arg nested under $graphql.
 * We serve the arg value for the query by the name of arg name, e.g.
 *
 * {
 *   args: {
 *     $graphql: {
 *       AddonVisualTestsBuild: { project: { name: 'acme', ... } },
 *     },
 *   },
 * }
 *
 * Additionally, if you want to map the arg (optionally based on variables),
 * you can set `argTypes.$graphql.X.map`,
 *
 * eg.
 *
 * {
 *   argTypes: {
 *     $graphql: {
 *       AddonVisualTestsBuild: {
 *         map: ({ lastBuildOnBranch }, { selectedBuildId }) =>
 *          ({ project: { name: 'acme', ... } }),
 *       },
 *     },
 *   },
 * }
 */
export const graphQLArgLoader: Loader = async ({ argTypes, argsByTarget, parameters }) => {
  const handlers = Object.entries(argsByTarget.graphql?.$graphql || []).map(
    ([argName, inputResult]: [string, any]) =>
      graphql.query(argName, ({ variables }) => {
        const result = argTypes.$graphql[argName]?.map?.(inputResult, variables) ?? inputResult;
        return HttpResponse.json({ data: result });
      })
  );

  return mswLoader({
    parameters: { msw: { handlers: [...handlers, ...(parameters.msw?.handlers || [])] } },
  });
};

const preview: Preview = {
  decorators: [
    withTheme,
    withGraphQLClient,
    withTelemetry,
    withAuth,
    withUninstall,
    withManagerApi,
    withRunBuild,
  ],
  loaders: [graphQLArgLoader],
  parameters: {
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    backgrounds: {
      disable: true,
    },
    viewport: {
      disable: true,
    },
    chromatic: {
      modes: baseModes,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    $graphql: { target: 'graphql' },
    getChannel: { type: 'function', target: 'manager-api' },
  },
  args: {
    getChannel: () => ({ on: fn(), off: fn(), emit: fn().mockName('channel.emit') }),
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Panel theme',
      toolbar: {
        icon: 'sidebaralt',
        title: 'Theme',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
          { value: 'right', icon: 'sidebaralt', title: 'Right 2-up' },
          { value: 'bottom', icon: 'bottombar', title: 'Bottom 2-up' },
        ],
      },
    },
  },
};

export default preview;
