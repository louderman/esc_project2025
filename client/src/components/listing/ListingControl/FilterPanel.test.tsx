import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import {
  initialListingState,
  listingReducer,
  type ListingState,
} from '@/reducers/listingReducer';
import { useReducer } from 'react';
import FilterPanel from './FilterPanel';

afterEach(() => {
  cleanup();
});

vi.mock('../../../hooks/hotels/useFilteredHotels', () => ({
  useFilteredHotels: vi.fn((hotels) => hotels),
}));

function FilterPanelWrapper({
  hotels,
  mockState,
  mockDispatch,
}: {
  hotels: (Hotel & Price)[];
  mockState?: ListingState;
  mockDispatch?: () => void;
}) {
  const [state, dispatch] = useReducer(listingReducer, initialListingState);

  return (
    <FilterPanel
      hotels={hotels}
      listingDispatch={mockDispatch ?? dispatch}
      listingState={mockState ?? state}
    />
  );
}

const mockHotels = [
  {
    id: '1',
    name: 'hotel 1',
    rating: 4,
    price: 120,
    amenities: { kitchen: true, tVInRoom: true },
  },
  {
    id: '2',
    name: 'hotel 2',
    rating: 5,
    price: 200,
    amenities: { airConditioning: true },
  },
] as (Price & Hotel)[];

describe('FilterPanel', () => {
  it('Test renders all filter sections', () => {
    render(<FilterPanelWrapper hotels={mockHotels} />);

    expect(screen.getByText('Filter by')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Star ratings')).toBeInTheDocument();
    expect(screen.getByText('Guest ratings')).toBeInTheDocument();
    expect(screen.getByText('Price range')).toBeInTheDocument();
    expect(screen.getByText('Amenities')).toBeInTheDocument();
  });

  it('Test calls dispatch when reset filter is clicked', async () => {
    const mockDispatch = vi.fn();
    render(
      <FilterPanelWrapper hotels={mockHotels} mockDispatch={mockDispatch} />
    );

    const resetButton = screen.getByRole('button', { name: /reset filter/i });
    await userEvent.click(resetButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_FILTERS' });
  });
});
