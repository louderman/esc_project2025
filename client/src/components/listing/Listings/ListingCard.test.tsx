import { afterEach, describe, expect, it } from 'vitest';
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
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ListingCard from './ListingCard';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

const mockHotel = {
  id: 'hotel123',
  name: 'Luxury Inn',
  address: '123 Orchard Road',
  rating: 5,
  imageCount: 1,
  image_details: { prefix: 'https://images.com/', suffix: '.jpg' },
  categories: { overall: { score: 87 } },
  amenities: { airConditioning: true },
  price: 420,
} as Hotel & Price;

const mockStayDates: StayDatesState = {
  checkinDate: new Date('2025-08-10'),
  checkoutDate: new Date('2025-08-12'),
};

const mockOccupancy: OccupancyState = {
  adults: 2,
  children: 1,
  rooms: 1,
};

function ListingWrapper({
  hotel,
  stayDates,
  occupancy,
}: {
  hotel: Price & Hotel;
  stayDates: StayDatesState;
  occupancy: OccupancyState;
}) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path='/'
          element={
            <ListingCard
              hotel={hotel}
              occupancy={occupancy}
              stayDates={stayDates}
            />
          }
        />
        <Route path='/hotel_detail' element={<div>Hotel Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
});

describe('Listing Card', () => {
  it('Test correctly hotel info', () => {
    render(
      <ListingWrapper
        hotel={mockHotel}
        occupancy={mockOccupancy}
        stayDates={mockStayDates}
      />
    );

    expect(screen.getByText(/Luxury Inn/)).toBeInTheDocument();
    expect(screen.getByText(/123 Orchard Road/)).toBeInTheDocument();
    expect(screen.getByText(/hotel/i)).toBeInTheDocument();
    expect(screen.getByText('SGD 420.00')).toBeInTheDocument();
    expect(screen.getByText('1 room, 2 nights')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('8.7')).toBeInTheDocument();
  });

  it('Test navigates to correct page on hotel card View click', async () => {
    render(
      <ListingWrapper
        hotel={mockHotel}
        occupancy={mockOccupancy}
        stayDates={mockStayDates}
      />
    );
    await userEvent.click(screen.getByText('View'));
    expect(screen.getByText('Hotel Detail Page')).toBeInTheDocument();
  });

  it('Test displays "-" when user rating is null/undefined', () => {
    const hotelWithNoRating = {
      ...mockHotel,
      categories: { overall: { score: null } },
    } as Price & Hotel;
    render(
      <ListingWrapper
        hotel={hotelWithNoRating}
        occupancy={mockOccupancy}
        stayDates={mockStayDates}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('Test renders fallback image on error', () => {
    render(
      <ListingWrapper
        hotel={mockHotel}
        occupancy={mockOccupancy}
        stayDates={mockStayDates}
      />
    );

    const image = screen.getByAltText('hotel img') as HTMLImageElement;

    act(() => fireEvent.error(image));
    expect(image.src).toContain('hotel_img_placeholder.png');
  });
});
