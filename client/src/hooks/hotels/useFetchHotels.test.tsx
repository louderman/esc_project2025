import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Hotel } from '../../../../types/Hotel';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchHotels } from './useFetchHotels';

const mockHotels = [
  { id: 'h1', name: 'hotel 1' },
  { id: 'h2', name: 'hotel 2' },
] as Hotel[];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFetchHotels', () => {
  it('Test fetches hotels successfully and sets state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHotels,
    });

    const { result } = renderHook(() => useFetchHotels(['dest1', 'dest2']));

    // Initially, loading is true
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // After fetch, loading is false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.hotels).toEqual(mockHotels);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('Test sets error on fetch failure', async () => {
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    const { result } = renderHook(() => useFetchHotels(['dest1']));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Fetch failed');

    consoleErrorMock.mockRestore();
  });

  it('Test uses cache when enabled', async () => {
    const { hotelCache } = await import('./useFetchHotels');
    hotelCache.set('dest1', mockHotels);

    global.fetch = vi.fn();

    const { result } = renderHook(() =>
      useFetchHotels(['dest1'], { cache: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.hotels).toEqual(mockHotels);
    expect(result.current.error).toBeNull();
  });

  it('calls fetch when destId is not in cache', async () => {
    const destId = 'not_cached';
    const { hotelCache } = await import('./useFetchHotels');
    hotelCache.delete(destId);

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockHotels,
    });

    const { result } = renderHook(() =>
      useFetchHotels([destId], { cache: true })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result.current.hotels).toEqual(mockHotels);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('Test handle empty destIds', () => {
    global.fetch = vi.fn();

    const { result } = renderHook(() => useFetchHotels([]));

    expect(result.current.loading).toBe(false);
    expect(result.current.hotels).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('Test aborts fetch on unmount', () => {
    const abortSpy = vi.fn();

    // Mock AbortController globally
    vi.stubGlobal(
      'AbortController',
      class {
        signal = 'mockSignal';
        abort = abortSpy;
      }
    );

    // Make fetch hang so we can test abort on unmount
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    const { unmount } = renderHook(() => useFetchHotels(['dest1']));

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });
});
