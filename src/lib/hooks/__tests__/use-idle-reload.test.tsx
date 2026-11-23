import { renderHook } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import {
  IDLE_RELOAD_MS,
  useBlockIdleReload,
  useIdleReload,
} from '../use-idle-reload';

const reload = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  reload.mockReset();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, reload },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useIdleReload', () => {
  it('reloads after the idle time without input', () => {
    renderHook(() => useIdleReload());
    vi.advanceTimersByTime(IDLE_RELOAD_MS - 60_000);
    expect(reload).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('restarts the idle time on input', () => {
    renderHook(() => useIdleReload());
    vi.advanceTimersByTime(IDLE_RELOAD_MS - 60_000);
    window.dispatchEvent(new Event('pointerdown'));
    vi.advanceTimersByTime(IDLE_RELOAD_MS - 60_000);
    expect(reload).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload while a form has unsaved input', () => {
    const blocker = renderHook(({ dirty }) => useBlockIdleReload(dirty), {
      initialProps: { dirty: true },
    });
    renderHook(() => useIdleReload());
    vi.advanceTimersByTime(IDLE_RELOAD_MS * 2);
    expect(reload).not.toHaveBeenCalled();

    blocker.rerender({ dirty: false });
    vi.advanceTimersByTime(60_000);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload while offline', () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    renderHook(() => useIdleReload());
    vi.advanceTimersByTime(IDLE_RELOAD_MS * 2);
    expect(reload).not.toHaveBeenCalled();
    onLine.mockRestore();
  });

  it('reloads right away when an idle tab becomes visible again', () => {
    renderHook(() => useIdleReload());
    vi.setSystemTime(Date.now() + IDLE_RELOAD_MS);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
