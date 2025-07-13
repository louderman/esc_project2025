import { useMemo } from 'react';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';

/**
 * usePricedHotels
 *
 * Combines hotel metadata with pricing information by matching hotel IDs.
 * Each resulting hotel object contains both hotel details and its associated price.
 *
 * @param hotels - An array of hotel metadata objects.
 * @param prices - An array of price objects, each associated with a hotel by ID.
 *
 * @returns An array of hotels with their corresponding price information merged in.
 */
export function usePricedHotels(hotels: Hotel[], prices: Price[]) {
  const hotelsWithPrice = useMemo(() => {
    // TODO: Enhance the algorithm
    // return INIT_HOTELS;
    console.log('trying to stitch hotel + price...');
    return prices.flatMap((price) => {
      const hotel = hotels.find((h) => h.id === price.id);
      return hotel ? [{ ...hotel, ...price }] : [];
    });
  }, [hotels, prices]);

  return hotelsWithPrice;
}
