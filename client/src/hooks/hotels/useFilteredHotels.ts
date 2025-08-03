import { useMemo } from 'react';
import type { Hotel } from '../../../../types/Hotel';
import type { Price } from '../../../../types/Price';
import type { FilterByOptions } from '../../reducers/listingReducer';

/**
 * useFilteredHotels
 *
 * @param hotelsWithPrice - An array of hotels that include price information.
 * @param filters - ListingReducer filterBy states:
 *   - `priceRange`: [min, max] price range.
 *   - `stars`: Array of star ratings to include (empty means include all).
 *   - `amenities`: Array of amenity keys the hotel must include (all must match).
 *   - `guestRating`: Minimum guest rating (e.g., 8 filters for 8.0 and above).
 * @returns A filtered array of hotels matching all specified criteria.
 */
export function useFilteredHotels(
  hotelsWithPrice: (Price & Hotel)[],
  filters: FilterByOptions
) {
  const { amenities, priceRange, stars, guestRating } = filters;
  const filteredHotels = useMemo(() => {
    const filteredHotels = hotelsWithPrice.filter((h) => {
      const inPriceRange = h.price >= priceRange[0] && h.price <= priceRange[1];
      const hasStar =
        stars.length === 0 || stars.includes(Math.floor(h.rating));
      const hasAmenity = amenities.every((a) =>
        Object.keys(h.amenities).includes(a)
      );
      const hotelGuestRating = h.categories.overall?.score ?? 0;
      const meetGuestRating = hotelGuestRating >= guestRating * 10;

      return inPriceRange && hasStar && hasAmenity && meetGuestRating;
    });

    return filteredHotels;
  }, [hotelsWithPrice, amenities, priceRange, stars, guestRating]);

  return filteredHotels;
}
