import { getValue, setValue } from "./common";
import { resetAddonState, useAddonState } from "./server";

class MockChannel {
  private listeners: Record<string, ((data: any) => void)[]> = {};

  on(event: string, cb: (data: any) => void) {
    this.listeners[event] = [...(this.listeners[event] ?? []), cb];
  }

  emit = jest.fn((event: string, payload: any) =>
    (this.listeners[event] || []).forEach((l) => l(payload))
  );
}

beforeEach(() => resetAddonState());

it("returns null on first call", () => {
  const fooState = useAddonState(new MockChannel(), "foo");

  expect(fooState.value).toBeUndefined();
});

it("emits getValue when reading", () => {
  const channel = new MockChannel();
  const fooState = useAddonState(channel, "foo");

  expect(fooState.value).toBeUndefined();

  expect(channel.emit).toHaveBeenCalledWith(getValue, { key: "foo" });
});

it("returns current value if received", () => {
  const channel = new MockChannel();
  const fooState = useAddonState(channel, "foo");

  expect(fooState.value).toBeUndefined();

  channel.emit(setValue, { key: "foo", value: "bar" });
  expect(fooState.value).toBe("bar");
});

it("returns value after setting", () => {
  const fooState = useAddonState(new MockChannel(), "foo");

  fooState.value = "bar";

  expect(fooState.value).toEqual("bar");
});

it("emits setValue when setting", () => {
  const channel = new MockChannel();
  const fooState = useAddonState(channel, "foo");

  fooState.value = "bar";

  expect(channel.emit).toHaveBeenCalledWith(setValue, { key: "foo", value: "bar" });
});

it("emits setValue after receiving getValue", () => {
  const channel = new MockChannel();
  const fooState = useAddonState(channel, "foo");

  fooState.value = "bar";

  expect(channel.emit).toHaveBeenCalledWith(setValue, { key: "foo", value: "bar" });

  channel.emit.mockClear();
  channel.emit(getValue, { key: "foo" });

  expect(channel.emit).toHaveBeenCalledWith(setValue, { key: "foo", value: "bar" });
});
