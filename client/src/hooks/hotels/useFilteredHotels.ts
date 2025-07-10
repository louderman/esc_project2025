import { useMemo } from 'react';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';
import type { FilterByOptions } from '../../reducers/listingReducer';
import type { AmenityKey } from '../../constants/amenities';

export function useFilteredHotels(
  hotelsWithPrice: (Price & Hotel)[],
  filters: FilterByOptions
) {
  const { amenities, priceRange, stars } = filters;
  const filteredHotels = useMemo(() => {
    const filteredHotels = hotelsWithPrice.filter((h) => {
      const inPriceRange = h.price >= priceRange[0] && h.price <= priceRange[1];
      const hasStar =
        stars.length === 0 || stars.includes(Math.floor(h.rating));
      const hasAmenity =
        amenities.length === 0 ||
        (Object.keys(h.amenities) as AmenityKey[]).some(
          (a) => h.amenities[a] && amenities.includes(a)
        );

      return inPriceRange && hasStar && hasAmenity;
    });

    return filteredHotels;
  }, [hotelsWithPrice, amenities, priceRange, stars]);

  return filteredHotels;
}
