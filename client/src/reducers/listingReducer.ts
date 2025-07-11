import type { AmenityKey } from '../constants/amenities';

export const SORT_OPTIONS = {
  DEFAULT: 'default',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  RATING_ASC: 'rating-asc',
  RATING_DESC: 'rating-desc',
  STAR_ASC: 'star-asc',
  STAR_DESC: 'star-desc',
} as const;
export type SortByOptions = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export const FILTER_OPTIONS = {
  priceRange: 'priceRange',
  stars: 'stars',
  amenities: 'amenities',
} as const;

export type FilterByOptions = {
  [FILTER_OPTIONS.priceRange]: [number, number];
  [FILTER_OPTIONS.stars]: number[];
  [FILTER_OPTIONS.amenities]: AmenityKey[];
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
