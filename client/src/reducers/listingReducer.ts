import type { AmenityKey } from '../constants/amenities';

export type SortByOptions = 'default' | 'price' | 'rating' | 'popularity';

export type FilterByOptions = {
  priceRange: [number, number];
  stars: number[];
  amenities: AmenityKey[];
};

export type ListingState = {
  sortBy: SortByOptions;
  filterBy: FilterByOptions;
};

export type ListingAction =
  | { type: 'SET_SORT'; payload: SortByOptions }
  | { type: 'SET_FILTER'; payload: Partial<FilterByOptions> }
  | { type: 'RESET_FILTERS' };

const initialFilterBy: FilterByOptions = {
  priceRange: [-1, 1000000],
  stars: [],
  amenities: [],
};

const initialSortBy: SortByOptions = 'default';

export const initialListingState: ListingState = {
  filterBy: initialFilterBy,
  sortBy: initialSortBy,
};

export function listingReducer(
  state: ListingState,
  action: ListingAction
): ListingState {
  switch (action.type) {
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_FILTER':
      return { ...state, filterBy: { ...state.filterBy, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filterBy: initialFilterBy };
    default:
      return state;
  }
}
