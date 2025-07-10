import { useMemo } from 'react';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';

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
