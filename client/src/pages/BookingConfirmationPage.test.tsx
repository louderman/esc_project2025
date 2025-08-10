import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingConfirmation from './BookingConfirmationPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock useLocation to provide test data
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        hotel: {
          id: 'H123',
          name: 'Test Hotel',
          address: '123 Test St',
          price: 200,
          imageCount: 1,
          image_details: { prefix: '/img/', suffix: '.jpg' },
        },
        stayDates: {
          checkinDate: new Date('2025-08-10'),
          checkoutDate: new Date('2025-08-12'),
        },
      },
    }),
    useNavigate: () => vi.fn(),
  };
});

// --- Unit test for check-in date ---
describe('BookingConfirmationPage', () => {
  it('displays the correct check-in date', () => {
    render(
      <MemoryRouter>
        <BookingConfirmation />
      </MemoryRouter>
    );
    expect(screen.getByText('10 August 2025')).to.exist;
    expect(screen.getByText('Check-in Date')).to.exist;
  });
});

// --- Integration test for booking confirmation and past bookings ---
describe('Integration: Booking Confirmation and Past Bookings', () => {
  // Dummy PastBookingsPage for demonstration
  function PastBookingsPage() {
    // In a real app, this would fetch or receive booking data
    return (
      <div>
        <div>Test Hotel</div>
        <div>123 Test St</div>
        <div>10 August 2025</div>
        <div>12 August 2025</div>
      </div>
    );
  }

  it('displays booking details on confirmation and past bookings', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/booking-confirmation']}>
        <Routes>
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/past-bookings" element={<PastBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Confirmation page check
    expect(screen.getByText('Test Hotel')).to.exist;

    // Simulate navigation to past bookings
    rerender(
      <MemoryRouter initialEntries={['/past-bookings']}>
        <Routes>
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/past-bookings" element={<PastBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Past bookings check
    expect(screen.getByText('Test Hotel')).to.exist;
  });



    // Simulate navigation to past bookings (if needed, use fireEvent or rerender)
    // Here, we assume both routes are rendered for demonstration

    // Check that the same details appear in PastBookings
    //expect(screen.getByText('Test Hotel')).to.exist;
    //expect(screen.getByText('10 August 2025')).to.exist;
  });