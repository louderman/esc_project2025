import { useMemo } from 'react';
import type { Hotel } from '../../../../types/Hotel';
import {
  SORT_OPTIONS,
  type SortByOptions,
} from '../../reducers/listingReducer';
import type { Price } from '../../../../types/Price';

/**
 * useSortedHotels
 *
 * @param pricedHotels - The array of hotels (with prices) to be sorted.
 * @param sortOptions - The selected sort criteria from predefined `SORT_OPTIONS` from `listingReducer`.
 * @param useSearchRank - Whether to sort by `searchRank` before applying the sort option (default: true).
 * @returns A memoized, sorted array of hotels.
 */
export function useSortedHotels(
  pricedHotels: (Hotel & Price)[],
  sortOptions: SortByOptions,
  useSearchRank: boolean = true
) {
  const sortedHotels = useMemo(() => {
    const hotelsCopy = [...pricedHotels];
    if (useSearchRank) {
      hotelsCopy.sort((a, b) => b.searchRank - a.searchRank);
    }

    switch (sortOptions) {
      case SORT_OPTIONS.PRICE_ASC:
        hotelsCopy.sort((a, b) => a.price - b.price);
        break;
      case SORT_OPTIONS.PRICE_DESC:
        hotelsCopy.sort((a, b) => b.price - a.price);
        break;
      case SORT_OPTIONS.RATING_ASC:
        hotelsCopy.sort((a, b) => {
          const aRating = a.categories.overall?.score ?? -1;
          const bRating = b.categories.overall?.score ?? -1;
          return aRating - bRating;
        });
        break;
      case SORT_OPTIONS.RATING_DESC:
        hotelsCopy.sort((a, b) => {
          const aRating = a.categories.overall?.score ?? -1;
          const bRating = b.categories.overall?.score ?? -1;
          return bRating - aRating;
        });
        break;
      case SORT_OPTIONS.STAR_ASC:
        hotelsCopy.sort((a, b) => a.rating - b.rating);
        break;
      case SORT_OPTIONS.STAR_DESC:
        hotelsCopy.sort((a, b) => b.rating - a.rating);
        break;
    }
    return hotelsCopy;
  }, [pricedHotels, sortOptions, useSearchRank]);

  return sortedHotels;
}
