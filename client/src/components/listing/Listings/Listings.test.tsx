import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Price } from '../../../../../types/Price';
import type { Hotel } from '../../../../../types/Hotel';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Listings from './Listings';
import { MemoryRouter } from 'react-router-dom';

const mockHotels = Array.from({ length: 15 }).map((_, i) => ({
  id: `${i + 1}`,
  name: `Hotel ${i + 1}`,
  address: `Address ${i + 1}`,
  rating: 5,
  imageCount: 1,
  image_details: { prefix: 'https://images.com/', suffix: '.jpg' },
  categories: { overall: { score: 87 } },
  amenities: { airConditioning: true },
  price: 150 + i,
})) as (Hotel & Price)[];

const mockStayDates: StayDatesState = {
  checkinDate: new Date('2025-08-01'),
  checkoutDate: new Date('2025-08-05'),
};

const mockOccupancy: OccupancyState = {
  adults: 2,
  children: 0,
  rooms: 1,
};

afterEach(() => {
  cleanup();
});

function ListingsWrapper({
  page,
  setPage,
  hotels,
  loading,
  stayDates,
  occupancy,
}: {
  page?: number;
  setPage?: () => void;
  hotels?: (Hotel & Price)[];
  loading?: boolean;
  stayDates?: StayDatesState;
  occupancy?: OccupancyState;
}) {
  return (
    <MemoryRouter>
      <Listings
        page={page ?? 1}
        setPage={setPage ?? (() => {})}
        hotels={hotels ?? []}
        loading={loading ?? true}
        stayDates={stayDates ?? mockStayDates}
        occupancy={occupancy ?? mockOccupancy}
      />
    </MemoryRouter>
  );
}

describe('Listing', () => {
  it('Test renders loading skeletons when loading is true', () => {
    render(<ListingsWrapper />);

    expect(screen.getAllByTestId('hotel-listing-card-skeleton')).toHaveLength(
      3
    );
  });

  it('Test renders correct page and number of ListingCards on first load', () => {
    render(<ListingsWrapper loading={false} hotels={mockHotels} />);
    expect(screen.getAllByTestId('hotel-listing-card').length).toBe(10);
  });

  it('Test renders correct number of ListingCards based on page and items per page', () => {
    render(<ListingsWrapper loading={false} hotels={mockHotels} page={2} />);
    expect(screen.getAllByTestId('hotel-listing-card').length).toBe(15);
  });

  it('Test renders "No Hotel Found" when no hotels and not loading', () => {
    render(<ListingsWrapper loading={false} />);
    expect(screen.getByText(/No Hotel Found/)).toBeInTheDocument();
  });

  it('Test calls setpage on scroll when near bottom and not loading', () => {
    expect(mockHotels.length).toBeGreaterThanOrEqual(10);

    const mockSetPage = vi.fn();
    render(
      <ListingsWrapper
        hotels={mockHotels}
        loading={false}
        setPage={mockSetPage}
      />
    );

    // Mock window.scrollY, innerHeight and document.body.scrollHeight to simulate near bottom
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 900,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    act(() => fireEvent.scroll(window));

    expect(mockSetPage).toHaveBeenCalled();
  });

  it('Test does not calls setpage on scroll when near bottom but is loading', () => {
    expect(mockHotels.length).toBeGreaterThanOrEqual(10);

    const mockSetPage = vi.fn();
    render(
      <ListingsWrapper
        hotels={mockHotels}
        loading={true}
        setPage={mockSetPage}
      />
    );

    // Mock window.scrollY, innerHeight and document.body.scrollHeight to simulate near bottom
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 900,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    act(() => fireEvent.scroll(window));

    expect(mockSetPage).not.toHaveBeenCalled();
  });
});
