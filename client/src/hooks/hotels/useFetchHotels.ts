import { useEffect, useState } from 'react';
import type { Hotel } from '../../../../types/Hotel';

const hotelCache = new Map<string, Hotel[]>();
const SAFE_HOTEL_COUNT = 3; // to prevent getting blocked...

export function useFetchHotels(
  destIds: string[],
  options?: { cache?: boolean; maxParallelFetchCount?: number }
) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = options?.cache ?? false;
  const maxParallelFetchCount = Math.min(
    options?.maxParallelFetchCount ?? SAFE_HOTEL_COUNT,
    SAFE_HOTEL_COUNT
  );

  useEffect(() => {
    if (!destIds || destIds.length === 0) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchHotels() {
      setLoading(true);
      setError(null);

      try {
        const allHotels: Hotel[] = [];

        await Promise.all(
          destIds.slice(0, maxParallelFetchCount).map(async (destId) => {
            if (options?.cache && hotelCache.has(destId)) {
              allHotels.push(...hotelCache.get(destId)!);
              return;
            }

            const res = await fetch(`/api/hotel/query?dest_id=${destId}`, {
              signal,
            });

            if (!res.ok) {
              console.log(`Failed to fetch for dest ${destId}`);
              return;
            }

            const data: Hotel[] = await res.json();
            allHotels.push(...data);

            if (options?.cache) {
              hotelCache.set(destId, data);
            }
          })
        );

        if (cache) {
          for (const destId of destIds.slice(
            maxParallelFetchCount,
            destIds.length
          )) {
            if (hotelCache.has(destId)) {
              allHotels.push(...hotelCache.get(destId)!);
            }
          }
        }

        // Remove duplicated hotels (probably bcz multiple dests have same hotels?)
        const uniqueHotelsMap = new Map<string, Hotel>();
        allHotels.forEach((hotel) => {
          if (!uniqueHotelsMap.has(hotel.id)) {
            uniqueHotelsMap.set(hotel.id, hotel);
          }
        });
        const uniqueHotels = Array.from(uniqueHotelsMap.values());

        setHotels(uniqueHotels);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          console.error('Fetch hotel error:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
    return () => controller.abort();
  }, [JSON.stringify(destIds), options?.cache]);

  return { hotels, loading, error };
}
