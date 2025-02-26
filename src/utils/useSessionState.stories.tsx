import { expect, userEvent, waitFor } from "@storybook/test";
import { within } from "@storybook/testing-library";
import React, { useEffect } from "react";

import { ADDON_ID } from "../constants";
import { playAll } from "./playAll";
import { useSessionState } from "./useSessionState";

type Props = { id: string; initialState: any };

const UseSessionState = ({ id, initialState, update }: Props & { update: string }) => {
  const [state, setState] = useSessionState(id, initialState);
  const json = JSON.stringify(state, null, 2);
  return (
    <>
      <pre key={json}>{json}</pre>
      <button type="button" onClick={() => setState({ update })}>
        set {update}
      </button>
    </>
  );
};

const Component = (props: Props) => {
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    if (initialized) return;
    sessionStorage.setItem(`${ADDON_ID}/state/PredefinedState`, JSON.stringify({ foo: "bar" }));
    sessionStorage.setItem(`${ADDON_ID}/state`, "PredefinedState");
    setInitialized(true);
  }, [initialized]);

  return (
    initialized && (
      <>
        <UseSessionState {...props} update="one" />
        <UseSessionState {...props} update="two" />
        <UseSessionState {...props} update="three" />
      </>
    )
  );
};

const expectState = async (context: any, expected: any) => {
  const elements = context.canvasElement.getElementsByTagName("pre");
  await Promise.all(
    Array.from(elements).map(async (element: any) => {
      const data = await waitFor(() => JSON.parse(element.textContent as any));
      await expect(data).toEqual(expected);
    }),
  );
};

export default {
  component: Component,
  args: {
    initialState: { initial: true },
  },
  parameters: {
    chromatic: {
      modes: {
        Light: { theme: "light", viewport: "default" },
      },
    },
  },
};

export const InitialState = {
  args: {
    id: Math.random().toString(16),
    initialState: { initial: "initial" },
  },
  play: playAll((context) => expectState(context, { initial: "initial" })),
};

export const LazyInitialState = {
  args: {
    id: Math.random().toString(16),
    initialState: () => ({ initial: "lazy" }),
  },
  play: playAll((context) => expectState(context, { initial: "lazy" })),
};

export const PredefinedState = {
  args: {
    id: "PredefinedState",
  },
  play: playAll((context) => expectState(context, { foo: "bar" })),
};

export const SynchronizedState = {
  args: {
    id: Math.random().toString(16),
  },
  play: playAll(async (context) => {
    const canvas = within(context.canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /one/ }));
    await expectState(context, { update: "one" });
  }),
};

export const EventuallyConsistent = {
  args: {
    id: Math.random().toString(16),
  },
  play: playAll(async (context) => {
    const canvas = within(context.canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /one/ }));
    await expectState(context, { update: "one" });

    await userEvent.click(await canvas.findByRole("button", { name: /two/ }));
    await userEvent.click(await canvas.findByRole("button", { name: /one/ }));
    await userEvent.click(await canvas.findByRole("button", { name: /three/ }));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expectState(context, { update: "three" });
  }),
};

export const EventListener = {
  args: {
    id: Math.random().toString(16),
  },
  play: playAll(async (context) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    sessionStorage.setItem(`${ADDON_ID}/state/${context.args.id}`, JSON.stringify({ bar: "baz" }));
    window.dispatchEvent(new StorageEvent("session-storage", { key: context.args.id }));
    await waitFor(() => expectState(context, { bar: "baz" }));
  }),
};
