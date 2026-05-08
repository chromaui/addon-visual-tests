import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mirror the pattern from useShareAuth.test.ts: mock React hooks to work outside component context
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: (initial: unknown) => ({ current: initial }),
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => void | (() => void)) => fn(),
  };
});

const ALLOWED_ORIGIN = 'https://www.chromatic.com';
const ALLOWED_URL = `${ALLOWED_ORIGIN}/authorize?foo=bar`;

type MsgLike = { type: string; origin: string; data: unknown; source: unknown };

class FakeEventTarget {
  private listeners: Map<string, Set<(e: MsgLike) => void>> = new Map();

  addEventListener(type: string, listener: (e: MsgLike) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (e: MsgLike) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(event: MsgLike) {
    this.listeners.get(event.type)?.forEach((l) => l(event));
  }
}

let fakeWindow: FakeEventTarget;
let mockPopup: { focus: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };

beforeEach(() => {
  fakeWindow = new FakeEventTarget();
  mockPopup = { focus: vi.fn(), close: vi.fn() };

  vi.stubGlobal('window', {
    addEventListener: fakeWindow.addEventListener.bind(
      fakeWindow
    ) as typeof window.addEventListener,
    removeEventListener: fakeWindow.removeEventListener.bind(
      fakeWindow
    ) as typeof window.removeEventListener,
    innerWidth: 1200,
    innerHeight: 1000,
    screenLeft: 0,
    screenTop: 0,
    open: vi.fn(() => mockPopup),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeMsg(origin: string, data: unknown, source: unknown): MsgLike {
  return { type: 'message', origin, data, source };
}

const { useChromaticDialog } = await import('./useChromaticDialog');

describe('useChromaticDialog', () => {
  it('origin filter: ignores messages from a non-allowed origin', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    (openDialog as (url: string) => void)(ALLOWED_URL);
    fakeWindow.dispatch(makeMsg('https://evil.example.com', { message: 'login' }, mockPopup));

    expect(handler).not.toHaveBeenCalled();
  });

  it('origin filter: delivers messages from the allowed origin', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    (openDialog as (url: string) => void)(ALLOWED_URL);
    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, mockPopup));

    expect(handler).toHaveBeenCalledWith({ message: 'login' });
  });

  it('source filter: ignores messages whose source is a different window', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    (openDialog as (url: string) => void)(ALLOWED_URL);

    const otherPopup = { focus: vi.fn(), close: vi.fn() };
    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, otherPopup));

    expect(handler).not.toHaveBeenCalled();
  });

  it('additionalOrigins: messages from extra allowed origins are delivered', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    const extra = 'https://extra.chromatic.com';
    (openDialog as (url: string, extra: string[]) => void)(ALLOWED_URL, [extra]);
    fakeWindow.dispatch(makeMsg(extra, { message: 'login' }, mockPopup));

    expect(handler).toHaveBeenCalledWith({ message: 'login' });
  });

  it('invalid payload: silently ignored (no handler call)', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    (openDialog as (url: string) => void)(ALLOWED_URL);
    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'totally-unknown' }, mockPopup));

    expect(handler).not.toHaveBeenCalled();
  });

  it('popup reuse: second openDialog replaces the ref; messages from first popup are ignored', () => {
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    const firstPopup = { focus: vi.fn(), close: vi.fn() };
    const secondPopup = { focus: vi.fn(), close: vi.fn() };
    (window.open as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(firstPopup)
      .mockReturnValueOnce(secondPopup);

    (openDialog as (url: string) => void)(ALLOWED_URL);
    (openDialog as (url: string) => void)(ALLOWED_URL);

    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, firstPopup));
    expect(handler).not.toHaveBeenCalled();

    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, secondPopup));
    expect(handler).toHaveBeenCalledWith({ message: 'login' });
  });

  it('closeDialog: calls close on the current popup', () => {
    const [openDialog, closeDialog] = useChromaticDialog();

    (openDialog as (url: string) => void)(ALLOWED_URL);
    (closeDialog as () => void)();

    expect(mockPopup.close).toHaveBeenCalledOnce();
  });

  it('closeDialog: subsequent messages from the closed popup are ignored', () => {
    const handler = vi.fn();
    const [openDialog, closeDialog] = useChromaticDialog(handler);

    (openDialog as (url: string) => void)(ALLOWED_URL);
    (closeDialog as () => void)();

    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, mockPopup));

    expect(handler).not.toHaveBeenCalled();
  });

  it('popup blocked: openDialog returns false and accepts no messages', () => {
    (window.open as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);
    const handler = vi.fn();
    const [openDialog] = useChromaticDialog(handler);

    const opened = (openDialog as (url: string) => boolean)(ALLOWED_URL);

    expect(opened).toBe(false);
    fakeWindow.dispatch(makeMsg(ALLOWED_ORIGIN, { message: 'login' }, mockPopup));
    expect(handler).not.toHaveBeenCalled();
  });

  it('openDialog: returns true when the popup opens successfully', () => {
    const [openDialog] = useChromaticDialog();
    const opened = (openDialog as (url: string) => boolean)(ALLOWED_URL);
    expect(opened).toBe(true);
  });
});
