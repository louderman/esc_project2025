import { describe, expect, it } from 'vitest';
import {
  FILTER_OPTIONS,
  initialListingState,
  listingReducer,
  SORT_OPTIONS,
} from './listingReducer';

describe('listingReducer', () => {
  it('Test returns initial state when passed an unknown action (and correct initial state)', () => {
    const result = listingReducer(initialListingState, {
      type: 'UNKNOWN_ACTION' as never,
    });
    expect(result).toEqual(initialListingState);
  });

  it('Test set sort state only', () => {
    const result = listingReducer(initialListingState, {
      type: 'SET_SORT',
      payload: SORT_OPTIONS.PRICE_DESC,
    });
    expect(result).toEqual({
      ...initialListingState,
      sortBy: SORT_OPTIONS.PRICE_DESC,
    });
  });

  it('Test set filter state only', () => {
    const result = listingReducer(initialListingState, {
      type: 'SET_FILTER',
      payload: {
        [FILTER_OPTIONS.stars]: [2, 3],
        [FILTER_OPTIONS.amenities]: ['parkingGarage'],
      },
    });

    expect(result).toEqual({
      ...initialListingState,
      filterBy: {
        ...initialListingState.filterBy,
        [FILTER_OPTIONS.stars]: [2, 3],
        [FILTER_OPTIONS.amenities]: ['parkingGarage'],
      },
    });
  });

  it('Test set both sort and filter state', () => {
    const afterSort = listingReducer(initialListingState, {
      type: 'SET_SORT',
      payload: SORT_OPTIONS.PRICE_ASC,
    });
    const result = listingReducer(afterSort, {
      type: 'SET_FILTER',
      payload: {
        [FILTER_OPTIONS.priceRange]: [10, 20],
        [FILTER_OPTIONS.guestRating]: 5,
      },
    });

    expect(result).toEqual({
      sortBy: SORT_OPTIONS.PRICE_ASC,
      filterBy: {
        ...initialListingState.filterBy,
        [FILTER_OPTIONS.priceRange]: [10, 20],
        [FILTER_OPTIONS.guestRating]: 5,
      },
    });
  });

  it('Test reset filters', () => {
    const afterSort = listingReducer(initialListingState, {
      type: 'SET_SORT',
      payload: SORT_OPTIONS.PRICE_ASC,
    });
    const afterFilter = listingReducer(afterSort, {
      type: 'SET_FILTER',
      payload: {
        [FILTER_OPTIONS.priceRange]: [10, 20],
        [FILTER_OPTIONS.guestRating]: 5,
      },
    });
    const result = listingReducer(afterFilter, {
      type: 'RESET_FILTERS',
    });

    expect(result).toEqual({
      sortBy: SORT_OPTIONS.PRICE_ASC,
      filterBy: initialListingState.filterBy,
    });
  });
});
