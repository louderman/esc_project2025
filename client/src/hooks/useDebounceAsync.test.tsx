import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounceAsync } from './useDebounceAsync';
import { act } from 'react';

describe('useDebounceAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Test callback called after delay', async () => {
    const mockFn = vi.fn().mockResolvedValue('done');

    const { result } = renderHook(() => useDebounceAsync(mockFn, 500));

    let promise: Promise<any>;
    act(() => {
      promise = result.current('arg1');
    });

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    await expect(promise!).resolves.toBe('done');
    expect(mockFn).toHaveBeenCalledWith('arg1');
  });

  it('Test cancels previous call if called again quickly', async () => {
    const mockFn = vi.fn().mockResolvedValue('final');

    const { result } = renderHook(() => useDebounceAsync(mockFn, 300));

    act(() => {
      result.current('first');
      result.current('second');
    });

    vi.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });
});