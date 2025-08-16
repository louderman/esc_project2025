
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@stripe/react-stripe-js', () => {
  return {
    Elements: ({ children }: any) => <div data-testid="Elements">{children}</div>,
    useStripe: () => ({ createPaymentMethod: vi.fn().mockResolvedValue({}) }),
    useElements: () => ({ getElement: vi.fn().mockReturnValue({}) }),
    CardElement: (props: any) => <div data-testid="card-element" {...props} />,
    loadStripe: vi.fn(),
  };
});

import BookingPage from '../BookingPage';

function renderWithRouter(state?: any) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/booking', state } as any]}>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/confirmation" element={<div>CONFIRMATION</div>} />
        <Route path="/search" element={<div>SEARCH PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const baseState = {
  hotel: { id: 'hotel-456', name: 'Test Hotel', rating: 4.2, address: '123 Test St' },
  bookingDetails: {
    selectedRoom: { room: { roomType: 'Standard' }, rate: { price: 1.5 } },
    numberOfGuests: { adults: 2, children: 0, total: 2 },
    numberOfNights: 2,
    numberOfRooms: 1,
    checkinDate: '2025-08-10',
    checkoutDate: '2025-08-12',
    totalAmount: 4.95,
    pricePerNight: 1.5,
    hotelImage: '/img/0.jpg',
    hotelImages: ['/img/0.jpg'],
  },
  images: ['/img/0.jpg'],
};

describe('BookingPage – fallback & wiring (no payment flow here)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence/short-circuit any fetches inside the page (e.g., random destinations)
    if (!(globalThis as any).fetch) (globalThis as any).fetch = vi.fn();
    vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any);
  });

  it('renders inline fallback message when hotel is missing', async () => {
    renderWithRouter({ ...baseState, hotel: undefined });

    // BookingPage shows a message, not a redirect
    expect(
      await screen.findByText('No hotel selected, please return to listing page.')
    ).toBeInTheDocument();
  });

  it('renders booking review, selected room card, and basic wiring when hotel exists', async () => {
    renderWithRouter(baseState);

    // Booking review block (h2 inside the data-cy="booking-review" container)
    const reviewHeading = await screen.findByRole('heading', {
      level: 2,
      name: /review booking/i,
    });
    const review = reviewHeading.closest('[data-cy="booking-review"]');
    expect(review).toBeTruthy();

    // Basic content checks inside the review section
    expect(review).toHaveTextContent('Test Hotel');
    expect(review).toHaveTextContent('123 Test St');
    expect(review).toHaveTextContent('Aug 10, 2025');
    expect(review).toHaveTextContent('Aug 12, 2025');
    expect(review).toHaveTextContent('1 room · 2 guests');

    // Selected room card (h3 inside data-cy="selected-room-card")
    const selectedRoomHeading = screen.getByRole('heading', {
      level: 3,
      name: /selected room/i,
    });
    const selectedRoomCard = selectedRoomHeading.closest('[data-cy="selected-room-card"]');
    expect(selectedRoomCard).toBeTruthy();

    // Payment area mounted (we’re not testing submission here)
    // Payment area mounted (we’re not testing submission here)
    expect(screen.getByRole('button', { name: /pay/i })).toBeInTheDocument();
  });
});
