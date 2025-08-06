vi.mock('../usePollingAsync', () => ({
  usePollingAsync: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePollingAsync } from '../usePollingAsync';
import type { Price } from '../../../../types/Price';
import type { OccupancyState } from '@/components/listing/SearchBar/GuestInput/GuestInput';
import type { StayDatesState } from '@/components/listing/SearchBar/DateInput/DateInput';
import { act, renderHook } from '@testing-library/react';
import { useFetchHotelPrices } from './useFetchHotelPrices';

beforeEach(() => {
  vi.clearAllMocks();
});

const mockPrices = [
  { id: 'hotel1', price: 100 },
  { id: 'hotel2', price: 200 },
] as Price[];

const mockStayDates: StayDatesState = {
  checkinDate: new Date('2025-08-10'),
  checkoutDate: new Date('2025-08-15'),
};

const mockOccupancy: OccupancyState = { adults: 2, children: 1, rooms: 1 };

describe('useFetchHotelPrices', () => {
  it('Test fetches hotel prices successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        completed: true,
        hotels: mockPrices,
      }),
    });

    const { result } = renderHook(() =>
      useFetchHotelPrices(['dest_id1'], mockStayDates, mockOccupancy, 1000, {
        cache: false,
        fetchOnMountOnly: true,
      })
    );

    // fetch call manually
    const fetchFn = vi.mocked(usePollingAsync).mock.calls[0][0];
    await act(async () => {
      await fetchFn();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.prices).toEqual(mockPrices);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('Test fetch not called when checkin or checkout is missing', async () => {
    const mockStayDatesIncomplete = { checkinDate: null, checkoutDate: null };
    const { result } = renderHook(() =>
      useFetchHotelPrices(['dest_id1'], mockStayDatesIncomplete, mockOccupancy)
    );

    const fetchFn = vi.mocked(usePollingAsync).mock.calls[0][0];
    await act(async () => {
      await fetchFn();
    });

    expect(result.current.prices).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('Test sets error state when fetch fails', async () => {
    // Disable console.error first
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useFetchHotelPrices(['dest_id1'], mockStayDates, mockOccupancy)
    );

    const fetchFn = vi.mocked(usePollingAsync).mock.calls[0][0];

    await act(async () => {
      await fetchFn();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.loading).toBe(false);

    consoleErrorMock.mockRestore();
  });

  it('Test uses cache when enabled', async () => {
    const cacheKey = '123';
    const cachedPrices = [{ id: 'hotel3', price: 300 }] as Price[];

    const { priceCache } = await import('./useFetchHotelPrices');
    priceCache.set(cacheKey, cachedPrices);
    const { result } = renderHook(() =>
      useFetchHotelPrices([cacheKey], mockStayDates, mockOccupancy, 1000, {
        cache: true,
      })
    );

    const fetchFn = vi.mocked(usePollingAsync).mock.calls[0][0];

    await act(async () => {
      await fetchFn();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.prices).toEqual(cachedPrices);
  });

  it('Test fetch is called when key is not in cache', async () => {
    const cacheKey = 'not_cached';
    const { priceCache } = await import('./useFetchHotelPrices');
    priceCache.delete(cacheKey);

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        completed: true,
        hotels: mockPrices,
      }),
    });

    const { result } = renderHook(() =>
      useFetchHotelPrices([cacheKey], mockStayDates, mockOccupancy, 1000, {
        cache: true,
      })
    );

    const fetchFn = vi.mocked(usePollingAsync).mock.calls[0][0];

    await act(async () => {
      await fetchFn();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.prices).toEqual(mockPrices);
  });

  // Couldnt test this, useFakeTimer doesnt work for me
  // and usePollingAsync never run for some reason.....
  //   it('Test hook calls fetchPrice with debouncing', async () => {
  //   });
});
