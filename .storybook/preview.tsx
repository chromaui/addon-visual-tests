import { API, ManagerContext, State } from "@storybook/manager-api";
import type { Decorator, Loader, Preview } from "@storybook/react";
import {
  Global,
  ThemeProvider,
  convert,
  createReset,
  styled,
  themes,
  useTheme,
} from "@storybook/theming";
import { graphql } from "msw";
import { initialize, mswLoader } from "msw-storybook-addon";
import React from "react";

import { baseModes } from "../src/modes";

// Initialize MSW
initialize({
  onUnhandledRequest(req) {
    if (req.url.origin !== document.location.origin) {
      console.error(
        `[MSW] %s %s %s (UNHANDLED)`,
        new Date().toTimeString().slice(0, 8),
        req.method.toUpperCase(),
        req.url.href
      );
    }
  },
});

const Panels = styled.div<{ orientation: "right" | "bottom" }>(
  ({ orientation }) => ({
    flexDirection: orientation === "right" ? "row" : "column",
  }),
  {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    padding: 40,
  }
);

const Panel = styled.div<{ orientation: "right" | "bottom" }>(
  ({ orientation }) => ({
    width: orientation === "right" ? 420 : 880,
    height: orientation === "right" ? 640 : 300,
    overflow: "auto",
  }),
  ({ theme }) => ({
    containerType: "size",
    containerName: "storybookRoot",
    position: "relative",
    outline: `1px solid ${theme.appBorderColor}`,
    // Add a backdrop to the outline because appBorderColor is semi-transparent
    boxShadow: `0 0 0 1px ${theme.background.content}`,
    background: theme.background.content,
    color: theme.color.defaultText,
    fontSize: theme.typography.size.s2 - 1,
  })
);

const ThemedSetRoot = () => {
  const theme = useTheme();
  React.useEffect(() => {
    document.body.style.background = theme.background.content;
    document.body.style.color = theme.color.defaultText;
    document.body.style.fontSize = `${theme.typography.size.s2 - 1}px`;
  });
  return null;
};

// Render two panels side-by-side or stacked, depending on selected orientation
// Note this assumes any play functions are equipped to deal with multiple canvases
const withTheme = (StoryFn, { globals, parameters }) => {
  const theme = globals.theme || parameters.theme || "right";
  return theme === "light" || theme === "dark" ? (
    <ThemeProvider theme={convert(themes[theme])}>
      <Global styles={createReset} />
      <Global
        styles={{
          "#storybook-root": {
            height: "100vh",
            padding: 0,
            containerType: "size",
            containerName: "storybookRoot",
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

const withManagerApi: Decorator = (Story, { argsByTarget }) => (
  <ManagerContext.Provider
    value={{
      api: { addNotification: argsByTarget["manager-api"]?.addNotification } as API,
      state: {} as State,
    }}
  >
    <Story />
  </ManagerContext.Provider>
);

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
      graphql.query(argName, (req, res, ctx) => {
        const result = argTypes.$graphql[argName]?.map?.(inputResult, req.variables) ?? inputResult;

        return res(ctx.data(result));
      })
  );

  return mswLoader({
    parameters: { msw: { handlers: [...handlers, ...(parameters.msw?.handlers || [])] } },
  });
};

const preview: Preview = {
  decorators: [withTheme, withManagerApi],
  loaders: [graphQLArgLoader],
  parameters: {
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
    backgrounds: {
      disable: true,
    },
    viewport: {
      viewports: {
        default: { name: "Default", styles: { width: "960px", height: "720px" } },
      },
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
    layout: "fullscreen",
  },
  argTypes: {
    $graphql: { target: "graphql" },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Panel theme",
      toolbar: {
        icon: "sidebaralt",
        title: "Theme",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
          { value: "right", icon: "sidebaralt", title: "Right 2-up" },
          { value: "bottom", icon: "bottombar", title: "Bottom 2-up" },
        ],
      },
    },
  },
};

export default preview;
