import { useEffect, useState } from 'react';
import type { Hotel } from '../../../../types/Hotel';

const hotelCache = new Map<string, Hotel[]>();
const SAFE_HOTEL_COUNT = 3; // to prevent getting blocked...

export function useFetchHotels(
  destIds: string[],
  options?: { cache?: boolean }
) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          destIds.slice(0, SAFE_HOTEL_COUNT).map(async (destId) => {
            if (options?.cache && hotelCache.has(destId)) {
              allHotels.push(...hotelCache.get(destId)!);
              return;
            }

            const res = await fetch(`/api/hotel/query?dest_id=${destId}`, {
              signal,
            });

            if (!res.ok) throw new Error(`Failed to fetch for dest ${destId}`);

            const data: Hotel[] = await res.json();
            allHotels.push(...data);

            if (options?.cache) {
              hotelCache.set(destId, data);
            }
          })
        );

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

  console.log(
    'inner hotels',
    hotels.sort((a, b) => a.id.localeCompare(b.id))
  );
  return { hotels, loading, error };
}
