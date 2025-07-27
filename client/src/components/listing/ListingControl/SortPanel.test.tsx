import { useReducer } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  initialListingState,
  listingReducer,
  SORT_OPTIONS,
} from '../../../reducers/listingReducer';
import SortPanel from './SortPanel';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import { useSortedHotels } from '../../../hooks/hotels/useSortedHotels';

const pricedHotels = [
  {
    id: '1',
    name: '1',
    price: 50,
    rating: 2,
    searchRank: 3,
    categories: { overall: { score: 4.2 } },
  },
  {
    id: '2',
    name: '2',
    price: 50,
    rating: 2,
    searchRank: 5,
    categories: { overall: { score: 4.2 } },
  },

  {
    id: '3',
    name: '3',
    price: 500.52,
    rating: 5,
    searchRank: 1,
    categories: { overall: { score: 9.5 } },
  },
  {
    id: '4',
    name: '4',
    price: 150.16,
    rating: 3,
    searchRank: 5,
    categories: { overall: { score: 7.8 } },
  },
  {
    id: '5',
    name: '5',
    price: 120.15,
    rating: 4,
    searchRank: 2,
    categories: { overall: { score: null } },
  },
  {
    id: '6',
    name: '6',
    price: 80.0,
    rating: 1,
    searchRank: 4,
    categories: { overall: {} },
  },
] as (Hotel & Price)[];

function TestSortPanelWrapper() {
  const [state, dispatch] = useReducer(listingReducer, initialListingState);
  const sortedHotels = useSortedHotels(pricedHotels, state.sortBy);

  return (
    <>
      <SortPanel listingState={state} listingDispatch={dispatch} />
      <div data-testid='outside'>Outside</div>
      <div data-testid='sorted-output'>{state.sortBy}</div>
      {sortedHotels.map((h, i) => (
        <div key={`hotel-${i}`} data-testid={`hotel-${h.id}`}>
          {h.id}
        </div>
      ))}
    </>
  );
}

describe('SortPanel component', () => {
  beforeEach(() => {
    render(<TestSortPanelWrapper />);
  });

  afterEach(() => {
    cleanup();
  });

  it('Test displays sort options on click, hotels are sorted accordingly', () => {
    // Open sorting dropdown
    const trigger = screen.getByTestId('sort-select');
    fireEvent.click(trigger);

    // Select sort option
    const option = screen.getByTestId('sort-option-6');
    fireEvent.click(option);

    // Check if state was updated (shown in test div)
    const output = screen.getByTestId('sorted-output');
    expect(output.textContent).toBe(SORT_OPTIONS.STAR_DESC);

    // Check if the hotels are sorted
    const hotelIds = screen
      .getAllByTestId(/hotel-/)
      .map((el) => el.textContent);
    const sortedHotelIds = [...pricedHotels]
      .sort((a, b) => b.rating - a.rating)
      .map((h) => h.id);
    expect(hotelIds).toEqual(sortedHotelIds);

    // Check if sort panel is closed after selecting sort option
    expect(screen.queryByTestId('sort-option-0')).toBeNull();
  });

  it('Test closes dropdown when clicking outside', () => {
    // Open dropdown
    const trigger = screen.getByTestId('sort-select');
    fireEvent.click(trigger);
    expect(screen.getByTestId('sort-option-0')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByTestId('sort-option-0')).toBeNull();
  });
});
