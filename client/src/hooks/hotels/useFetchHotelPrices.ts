import { useState, useCallback } from 'react';
import type { StayDatesState } from '@/components/listing/SearchBar/DateInput/DateInput';
import type { OccupancyState } from '@/components/listing/SearchBar/GuestInput/GuestInput';
import { usePollingAsync } from '../usePollingAsync';
import type { Price, PriceResponse } from '../../../../types/Price';

const priceCache = new Map<string, Price[]>();
const SAFE_PRICE_COUNT = 3;

export function useFetchHotelPrices(
  destIds: string[],
  stayDates: StayDatesState,
  occupancy: OccupancyState,
  pollingInterval = 2000,
  options?: {
    cache?: boolean;
    fetchOnMountOnly?: boolean;
    maxParallelFetchCount?: number;
  }
) {
  const fetchOnMountOnly = options?.fetchOnMountOnly ?? true;
  const cache = options?.cache ?? false;
  const maxParallelFetchCount = Math.min(
    options?.maxParallelFetchCount ?? SAFE_PRICE_COUNT,
    SAFE_PRICE_COUNT
  );

  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchPrice = useCallback(async () => {
    console.log('called fetch price');
    if (
      !destIds ||
      destIds.length === 0 ||
      !stayDates.checkinDate ||
      !stayDates.checkoutDate ||
      !occupancy.adults
    ) {
      setLoading(false);
      return true;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const allPrices: Price[] = [];
      let allCompleted = true;

      await Promise.all(
        destIds.slice(0, maxParallelFetchCount).map(async (destId) => {
          if (cache && priceCache.has(destId)) {
            allPrices.push(...priceCache.get(destId)!);
            return;
          }

          const url = `/api/hotel-price/query?dest_id=${destId}&checkin=${formatDate(
            stayDates.checkinDate!
          )}&checkout=${formatDate(stayDates.checkoutDate!)}&guests=${
            occupancy.adults
          }`;

          const res = await fetch(url, { signal });

          if (!res.ok) {
            console.log(`Failed to fetch price for ${destId}`);
            return;
          }

          const data: PriceResponse = await res.json();

          if (data.completed) {
            allPrices.push(...data.hotels);
            if (cache) {
              priceCache.set(destId, data.hotels);
            }
          } else {
            allCompleted = false;
          }
        })
      );

      // Return the prices if it is cached (as no fetching is needed)
      if (cache) {
        for (const destId of destIds.slice(
          maxParallelFetchCount,
          destIds.length
        )) {
          if (priceCache.has(destId)) {
            allPrices.push(...priceCache.get(destId)!);
          }
        }
      }

      // Remove duplicated prices (probably bcz multiple dests have same prices?)
      const uniquePricesMap = new Map<string, Price>();
      allPrices.forEach((price) => {
        if (!uniquePricesMap.has(price.id)) {
          uniquePricesMap.set(price.id, price);
        }
      });
      const uniquePrices = Array.from(uniquePricesMap.values());

      setPrices(uniquePrices);
      setLoading(!allCompleted);
      return allCompleted;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('Fetch hotel error:', err);
      }
      setLoading(false);
      return true; // stop polling if error
    }
  }, [cache, JSON.stringify(destIds), stayDates, occupancy]);

  const startPolling = !!stayDates.checkinDate && !!stayDates.checkoutDate;
  usePollingAsync(fetchPrice, pollingInterval, startPolling, fetchOnMountOnly);

  return { prices, loading, error };
}
