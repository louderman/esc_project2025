import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePollingAsync } from './usePollingAsync';

describe('usePollingAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Test poll until callback returns true', async () => {
    const callback = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    renderHook(({ start }) => usePollingAsync(callback, 1000, start, true), {
      initialProps: { start: true },
    });

    await vi.advanceTimersByTimeAsync(3 * 2000);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('Test stop polling after first success if onceOnly is true', async () => {
    const callback = vi.fn().mockResolvedValue(true);

    const { rerender } = renderHook(
      ({ start }) => usePollingAsync(callback, 1000, start, true),
      {
        initialProps: { start: true },
      }
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(callback).toHaveBeenCalledTimes(1);

    // Re-render hook, and the hook shouldn't poll again
    rerender({ start: false });
    rerender({ start: true });

    await vi.advanceTimersByTimeAsync(2000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('Test restart polling if onceOnly is false', async () => {
    const callback = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    const { rerender } = renderHook(
      ({ start }) => usePollingAsync(callback, 1000, start, false),
      {
        initialProps: { start: true },
      }
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ start: false });
    rerender({ start: true });

    await vi.advanceTimersByTimeAsync(2000);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});