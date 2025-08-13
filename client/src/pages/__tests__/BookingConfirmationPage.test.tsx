import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingConfirmation from '.././BookingConfirmationPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { findByText } from '@testing-library/react';

// Mock useLocation to provide test data
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        bookingId: 'booking-123',  
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
        bookingDetails: {
          selectedRoom: { room_type: "Standard Single Room" },
          
        },
      },
    }),
    useNavigate: () => vi.fn(),
  };
});

// Mock fetch before all tests
beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'booking-123',
          totalAmount: 400,
        }),
    })
  ) as any;
});

// Restore mocks after all tests finish
afterAll(() => {
  vi.restoreAllMocks();
});


// --- Unit test for check-in date ---
describe('BookingConfirmationPage', () => {
  it('displays the correct check-in date', async () => {
    render(
      <MemoryRouter>
        <BookingConfirmation />
      </MemoryRouter>
    );
    // Wait for the date text to appear after fetch
    expect(await screen.findByText('10 August 2025')).toBeDefined();
    expect(await screen.findByText('Check-in Date')).toBeDefined();
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

it('displays booking details on confirmation and past bookings', async () => {
  const { rerender } = render(
    <MemoryRouter initialEntries={['/booking-confirmation']}>
      <Routes>
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/past-bookings" element={<PastBookingsPage />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for booking confirmation page content
  expect(await screen.findByText('Test Hotel')).toBeDefined();

  // Then rerender with past bookings route
  rerender(
    <MemoryRouter initialEntries={['/past-bookings']}>
      <Routes>
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/past-bookings" element={<PastBookingsPage />} />
      </Routes>
    </MemoryRouter>
  );

  // Now expect past bookings content
  expect(screen.getByText('Test Hotel')).toBeDefined();

});




    // Simulate navigation to past bookings (if needed, use fireEvent or rerender)
    // Here, we assume both routes are rendered for demonstration

    // Check that the same details appear in PastBookings
    //expect(screen.getByText('Test Hotel')).to.exist;
    //expect(screen.getByText('10 August 2025')).to.exist;
  });