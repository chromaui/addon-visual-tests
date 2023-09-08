import {
  Global,
  ThemeProvider,
  themes,
  createReset,
  convert,
  styled,
  useTheme,
} from "@storybook/theming";
import type { Loader, Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import React from "react";
import { graphql } from "msw";

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
    margin: 40,
  }
);

const Panel = styled.div<{ orientation: "right" | "bottom" }>(
  ({ orientation }) => ({
    width: orientation === "right" ? 420 : 880,
    height: orientation === "right" ? 640 : 300,
    overflow: "auto",
  }),
  ({ theme }) => ({
    position: "relative",
    outline: `1px solid ${theme.color.border}`,
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
      <Global styles={{ "#storybook-root": { height: "100vh", padding: 0 } }}></Global>
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

/**
 * An experiment with targeted args for MSW. This loader will serve a graphql
 * response for any arg targetted at 'msw'.
 * We serve the arg value for the query by the name of arg name, e.g.
 *
 * {
 *   argTypes: {
 *     AddonVisualTestsBuild: { target: 'msw' }.
 *   },
 *   args: {
 *     AddonVisualTestsBuild: { project: { name: 'acme', ... } },
 *   },
 * }
 */
const mswGraphQLArgsLoader: Loader = async ({ argTypes, argsByTarget, parameters }) => {
  const handlers = Object.entries(argsByTarget.msw || []).map(
    ([argName, result]: [string, any]) => {
      return graphql.query(argName, (req, res, ctx) => res(ctx.data(result)));
    }
  );

  return mswLoader({
    parameters: { msw: { handlers: [...handlers, ...parameters.msw.handlers] } },
  });
};

const preview: Preview = {
  decorators: [withTheme],
  loaders: [mswGraphQLArgsLoader],
  parameters: {
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
    backgrounds: {
      disable: true,
    },
    chromatic: {
      viewports: [960],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: "fullscreen",
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
