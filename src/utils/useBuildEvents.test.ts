import { beforeEach, describe, expect, it, vi } from 'vitest';

import { START_BUILD, TELEMETRY } from '../constants';

const mocks = vi.hoisted(() => ({
  emit: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: () => null,
    useEffect: vi.fn(),
    useMemo: (factory: () => unknown) => factory(),
    useState: (initial: unknown) => [initial, vi.fn()],
  };
});

vi.mock('storybook/manager-api', () => ({
  useChannel: () => mocks.emit,
}));

vi.mock('./debounce', () => ({
  debounce: (_key: string, callback: (...args: any[]) => unknown) => callback,
}));

const { useBuildEvents } = await import('./useBuildEvents');

describe('useBuildEvents telemetry', () => {
  beforeEach(() => {
    mocks.emit.mockClear();
  });

  it('emits start telemetry when the Test Provider calls startBuild()', () => {
    const { startBuild } = useBuildEvents({
      localBuildProgress: undefined,
      accessToken: 'access-token',
    });

    // TestProviderRender lives outside TelemetryProvider and invokes startBuild() without a screen.
    startBuild();

    expect(mocks.emit).toHaveBeenNthCalledWith(1, START_BUILD, {
      accessToken: 'access-token',
    });
    expect(mocks.emit).toHaveBeenNthCalledWith(2, TELEMETRY, {
      action: 'startBuild',
    });
  });
});
